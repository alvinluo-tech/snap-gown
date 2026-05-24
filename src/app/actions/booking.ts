"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { generateOrderNo, generatePaymentRef } from "@/lib/utils";

export async function bookSlot(slotId: string, photographerId: string, pricePence: number) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  // Release expired holds and cancel expired orders
  await supabase.rpc("release_expired_holds");

  // Check photographer is not suspended
  const { data: photographer } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", photographerId)
    .single();

  if (!photographer || photographer.account_status === "SUSPENDED") {
    throw new Error("Photographer is not available");
  }

  // Try to lock the slot with pessimistic update
  const holdExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { data: slot, error: slotError } = await supabase
    .from("availability_slots")
    .update({
      status: "HELD",
      hold_expires_at: holdExpiresAt,
    })
    .eq("id", slotId)
    .eq("status", "AVAILABLE")
    .select()
    .single();

  if (slotError || !slot) {
    throw new Error("Slot is no longer available. It may have been booked by another student.");
  }

  // Create the order with payment_ref and 15% commission
  const orderNo = generateOrderNo();
  const paymentRef = generatePaymentRef();
  const commissionRate = 15.0;
  const platformFeePence = Math.round(pricePence * (commissionRate / 100));

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_no: orderNo,
      payment_ref: paymentRef,
      user_id: user.id,
      photographer_id: photographerId,
      slot_id: slotId,
      total_amount_pence: pricePence,
      commission_rate_pct: commissionRate,
      platform_fee_pence: platformFeePence,
      status: "PENDING_PAYMENT",
    })
    .select()
    .single();

  if (orderError) {
    // Rollback: release the slot
    await supabase
      .from("availability_slots")
      .update({ status: "AVAILABLE", hold_expires_at: null })
      .eq("id", slotId);
    throw new Error("Failed to create order: " + orderError.message);
  }

  // Log order creation
  await supabase.from("order_status_logs").insert({
    order_id: order.id,
    from_status: null,
    to_status: "PENDING_PAYMENT",
    actor_id: user.id,
    note: "Order created",
  });

  return order;
}

export async function cancelBooking(orderId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "PENDING_PAYMENT") {
    throw new Error("Can only cancel pending payment orders");
  }

  // Cancel order and release slot
  await supabase
    .from("orders")
    .update({ status: "CANCELLED" })
    .eq("id", orderId);

  await supabase
    .from("availability_slots")
    .update({ status: "AVAILABLE", hold_expires_at: null })
    .eq("id", order.slot_id);

  // Log cancellation
  await supabase.from("order_status_logs").insert({
    order_id: orderId,
    from_status: "PENDING_PAYMENT",
    to_status: "CANCELLED",
    actor_id: user.id,
    note: "Cancelled by student",
  });

  return { success: true };
}

export async function getStudentOrders() {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("orders")
    .select("*, availability_slots(slot_date, start_time, end_time, school_slug), profiles!photographer_id(full_name, wechat_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
