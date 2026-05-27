"use server";

import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { sendPaymentNotification } from "@/lib/resend";
import { penceToPounds, penceToRMB } from "@/lib/utils";

export async function uploadPaymentProof(orderId: string, file: File) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  // Get the order with slot info
  const { data: order } = await supabase
    .from("orders")
    .select("*, availability_slots!slot_id(slot_date, start_time, end_time, school_slug)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "PENDING_PAYMENT") {
    throw new Error("Order is not in pending payment status");
  }

  const admin = createSupabaseAdmin();

  // Self-healing: Pre-create storage bucket if it doesn't exist on remote instance
  try {
    const { data: bucket } = await admin.storage.getBucket("payment-proofs");
    if (!bucket) {
      await admin.storage.createBucket("payment-proofs", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
    }
  } catch {
    // Ignore error if already created
  }

  // Upload file to Supabase Storage via Admin to bypass RLS policies
  const fileName = `${user.id}/${orderId}-${Date.now()}.${file.name.split(".").pop()}`;
  const { data: uploadData, error: uploadError } = await admin.storage
    .from("payment-proofs")
    .upload(fileName, file);

  if (uploadError) throw new Error("Upload failed: " + uploadError.message);

  // Get public URL
  const {
    data: { publicUrl },
  } = admin.storage.from("payment-proofs").getPublicUrl(uploadData.path);

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
  if (order.slot_id) {
    await supabase
      .from("availability_slots")
      .update({ hold_expires_at: null })
      .eq("id", order.slot_id);
  }

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
  const slot = order.availability_slots as { slot_date: string; start_time: string; end_time: string; school_slug: string } | null;

  try {
    await sendPaymentNotification({
      photographerEmail: `${photographer?.wechat_id || "photographer"}@snapgown.placeholder`,
      photographerName: photographer?.full_name || "摄影师",
      studentName: student?.full_name || "Student",
      bookingId: order.order_no,
      shootDate: slot?.slot_date || "",
      shootTime: slot ? `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}` : "",
      shootLocation: slot?.school_slug || "待定",
      packageName: "毕业照拍摄",
      amountCNY: penceToRMB(order.total_amount_pence),
    });
  } catch {
    // Email failure shouldn't block the flow
    console.error("Failed to send email notification");
  }

  return { success: true, publicUrl };
}
