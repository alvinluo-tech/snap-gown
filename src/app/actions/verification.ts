"use server";

import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { sendOverdueAlert, sendSuspensionNotice } from "@/lib/resend";
import { penceToPounds } from "@/lib/utils";

const COMMISSION_THRESHOLD_PENCE = 3000; // £30.00

export async function confirmPayment(orderId: string) {
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

  // Log status change
  await supabase.from("order_status_logs").insert({
    order_id: orderId,
    from_status: "PROOF_SUBMITTED",
    to_status: "CONFIRMED",
    actor_id: user.id,
    note: "Photographer confirmed payment",
  });

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

  // Write commission ledger entry
  await supabase.from("commission_ledger").insert({
    order_id: orderId,
    photographer_id: order.photographer_id,
    platform_fee_pence: platformFee,
    ledger_status: "PENDING",
  });

  // Log status change
  await supabase.from("order_status_logs").insert({
    order_id: orderId,
    from_status: "CONFIRMED",
    to_status: "COMPLETED",
    actor_id: user.id,
    note: `Order completed. Commission: ${penceToPounds(platformFee)}`,
  });

  // Check circuit breaker
  const { data: profile } = await supabase
    .from("profiles")
    .select("commission_owed_pence")
    .eq("id", order.photographer_id)
    .single();

  if (profile && (profile.commission_owed_pence ?? 0) > COMMISSION_THRESHOLD_PENCE) {
    await supabase
      .from("profiles")
      .update({ account_status: "SUSPENDED" })
      .eq("id", order.photographer_id);

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

  // Revert to pending payment and clear proof
  await supabase
    .from("orders")
    .update({
      status: "CANCELLED",
      payment_proof_url: null,
      proof_submitted_at: null,
    })
    .eq("id", orderId);

  // Release slot
  await supabase
    .from("availability_slots")
    .update({ status: "AVAILABLE", hold_expires_at: null })
    .eq("id", order.slot_id);

  // Log rejection
  await supabase.from("order_status_logs").insert({
    order_id: orderId,
    from_status: "PROOF_SUBMITTED",
    to_status: "CANCELLED",
    actor_id: user.id,
    note: `Photographer rejected: ${reason}`,
  });

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

  // Log
  await supabase.from("order_status_logs").insert({
    order_id: orderId,
    from_status: "PROOF_SUBMITTED",
    to_status: "VERIFICATION_OVERDUE",
    actor_id: user?.id || "00000000-0000-0000-0000-000000000000",
    note: "12-hour verification window expired",
  });

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

// === Admin Functions ===

export async function adminConfirmOrder(orderId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") throw new Error("Admin access required");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");

  // Use RPC for atomic admin override
  const adminClient = createSupabaseAdmin();
  await adminClient.rpc("admin_confirm_order", {
    target_order_id: orderId,
    admin_id: user.id,
  });

  return { success: true };
}

export async function adminRejectOrder(orderId: string, reason: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") throw new Error("Admin access required");

  const adminClient = createSupabaseAdmin();
  await adminClient.rpc("admin_reject_order", {
    target_order_id: orderId,
    admin_id: user.id,
    reason: reason,
  });

  return { success: true };
}

export async function getAdminOrders() {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") throw new Error("Admin access required");

  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, availability_slots(slot_date, start_time, end_time, school_slug), student:profiles!user_id(full_name, wechat_id), photographer:profiles!photographer_id(full_name)"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminStats() {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") throw new Error("Admin access required");

  // Get counts for each status
  const statuses = [
    "PENDING_PAYMENT",
    "PROOF_SUBMITTED",
    "CONFIRMED",
    "VERIFICATION_OVERDUE",
    "COMPLETED",
    "CANCELLED",
  ] as const;

  const stats: Record<string, number> = {};
  for (const status of statuses) {
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    stats[status] = count || 0;
  }

  // Total commission owed
  const { data: photographers } = await supabase
    .from("profiles")
    .select("commission_owed_pence")
    .eq("role", "PHOTOGRAPHER");

  const totalCommission = (photographers || []).reduce(
    (sum, p) => sum + (p.commission_owed_pence || 0),
    0
  );

  // Pending approvals
  const { count: pendingApprovals } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "PHOTOGRAPHER")
    .eq("approval_status", "PENDING");

  return {
    orderStats: stats,
    totalCommissionPence: totalCommission,
    pendingApprovals: pendingApprovals || 0,
  };
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
