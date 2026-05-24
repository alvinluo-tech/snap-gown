"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { sendOverdueAlert, sendSuspensionNotice } from "@/lib/resend";
import { penceToPounds } from "@/lib/utils";

const COMMISSION_THRESHOLD_PENCE = 3000; // £30.00

export async function confirmPayment(orderId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  // Get the order - must be photographer
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("photographer_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "PROOF_SUBMITTED") {
    throw new Error("Order is not awaiting verification");
  }

  // Confirm order and mark slot as BOOKED
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "CONFIRMED",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) throw new Error(updateError.message);

  await supabase
    .from("availability_slots")
    .update({ status: "BOOKED" })
    .eq("id", order.slot_id);

  return { success: true };
}

export async function completeOrder(orderId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("photographer_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "CONFIRMED") {
    throw new Error("Order must be confirmed before completion");
  }

  // Mark completed
  await supabase
    .from("orders")
    .update({ status: "COMPLETED" })
    .eq("id", orderId);

  // Increment commission owed
  const platformFee = Math.round(
    order.total_amount_pence * (order.commission_rate_pct / 100)
  );

  await supabase.rpc("increment_commission_owed", {
    target_photographer_id: order.photographer_id,
    amount_pence: platformFee,
  });

  // Check circuit breaker (熔断机制)
  const { data: profile } = await supabase
    .from("profiles")
    .select("commission_owed_pence")
    .eq("id", order.photographer_id)
    .single();

  if (profile && (profile.commission_owed_pence ?? 0) > COMMISSION_THRESHOLD_PENCE) {
    // Suspend the photographer
    await supabase
      .from("profiles")
      .update({ account_status: "SUSPENDED" })
      .eq("id", order.photographer_id);

    // Send suspension notice
    try {
      await sendSuspensionNotice({
        photographerEmail: `${user.email || "photographer"}@snapgown.placeholder`,
        debtAmountGBP: penceToPounds(profile.commission_owed_pence ?? 0),
      });
    } catch {
      console.error("Failed to send suspension notice");
    }
  }

  return { success: true };
}

export async function rejectPayment(orderId: string, reason: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("photographer_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "PROOF_SUBMITTED") {
    throw new Error("Order is not awaiting verification");
  }

  // Revert to pending payment
  await supabase
    .from("orders")
    .update({
      status: "PENDING_PAYMENT",
      payment_proof_url: null,
      proof_submitted_at: null,
    })
    .eq("id", orderId);

  // Re-enable the 30-min hold timer
  const holdExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await supabase
    .from("availability_slots")
    .update({ hold_expires_at: holdExpiresAt })
    .eq("id", order.slot_id);

  return { success: true, reason };
}

export async function markOverdue(orderId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "PROOF_SUBMITTED") {
    throw new Error("Order is not awaiting verification");
  }

  await supabase
    .from("orders")
    .update({ status: "VERIFICATION_OVERDUE" })
    .eq("id", orderId);

  // Alert admin
  try {
    await sendOverdueAlert({
      orderNo: order.order_no,
      photographerId: order.photographer_id,
      amountGBP: penceToPounds(order.total_amount_pence),
    });
  } catch {
    console.error("Failed to send overdue alert");
  }

  return { success: true };
}

export async function getPhotographerOrders() {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("orders")
    .select("*, availability_slots(slot_date, start_time, end_time, school_slug), profiles!user_id(full_name, wechat_id, uk_phone)")
    .eq("photographer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getPhotographerDebt(photographerId: string) {
  const supabase = await createSupabaseServer();

  const { data: profile } = await supabase
    .from("profiles")
    .select("commission_owed_pence")
    .eq("id", photographerId)
    .single();

  return profile?.commission_owed_pence || 0;
}
