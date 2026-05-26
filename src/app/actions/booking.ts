"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { generateOrderNo, generatePaymentRef } from "@/lib/utils";

export async function bookSlot(slotId: string, photographerId: string) {
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

  // Use DB-side pessimistic locking RPC to avoid race conditions.
  const orderNo = generateOrderNo();
  const paymentRef = generatePaymentRef();
  const { data: holdResult, error: holdError } = await supabase.rpc("hold_slot_for_payment", {
    p_slot_id: slotId,
    p_order_no: orderNo,
    p_payment_ref: paymentRef,
  });

  if (holdError || !holdResult?.length) {
    throw new Error(holdError?.message || "Slot is no longer available. It may have been booked by another student.");
  }

  const heldOrderId = holdResult[0].order_id;
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", heldOrderId)
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Failed to fetch created order");
  }

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
