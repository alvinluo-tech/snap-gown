"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { sendPaymentNotification } from "@/lib/resend";
import { penceToPounds, penceToRMB } from "@/lib/utils";

export async function uploadPaymentProof(orderId: string, file: File) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  // Get the order
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "PENDING_PAYMENT") {
    throw new Error("Order is not in pending payment status");
  }

  // Upload file to Supabase Storage
  const fileName = `${user.id}/${orderId}-${Date.now()}.${file.name.split(".").pop()}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(fileName, file);

  if (uploadError) throw new Error("Upload failed: " + uploadError.message);

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("payment-proofs").getPublicUrl(uploadData.path);

  // Update order: clear hold timer, set proof submitted
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "PROOF_SUBMITTED",
      payment_proof_url: publicUrl,
      proof_submitted_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) throw new Error("Failed to update order: " + updateError.message);

  // Clear the hold_expires_at (timer destroyed)
  await supabase
    .from("availability_slots")
    .update({ hold_expires_at: null })
    .eq("id", order.slot_id);

  // Get photographer email for notification
  const { data: photographer } = await supabase
    .from("profiles")
    .select("full_name, wechat_id")
    .eq("id", order.photographer_id)
    .single();

  // Get student name
  const { data: student } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Send email notification to photographer
  try {
    await sendPaymentNotification({
      photographerEmail: `${photographer?.wechat_id || "photographer"}@snapgown.placeholder`,
      orderNo: order.order_no,
      studentName: student?.full_name || "Student",
      amountGBP: penceToPounds(order.total_amount_pence),
      amountRMB: penceToRMB(order.total_amount_pence),
    });
  } catch {
    // Email failure shouldn't block the flow
    console.error("Failed to send email notification");
  }

  return { success: true, publicUrl };
}
