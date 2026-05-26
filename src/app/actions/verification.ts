"use server";

import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { sendOverdueAlert, sendBookingConfirmation, sendCommissionSuspension } from "@/lib/resend";
import { penceToPounds } from "@/lib/utils";

const COMMISSION_THRESHOLD_PENCE = 3000; // £30.00
const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PROOF_SUBMITTED",
  "CONFIRMED",
  "VERIFICATION_OVERDUE",
  "COMPLETED",
  "CANCELLED",
] as const;

async function getOrderStatusCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>
) {
  const stats: Record<string, number> = {};
  for (const status of ORDER_STATUSES) {
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    stats[status] = count || 0;
  }
  return stats;
}

export async function confirmPayment(orderId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: order } = await supabase
    .from("orders")
    .select("*, availability_slots(*), profiles!user_id(*)")
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

  if (order.slot_id) {
    await supabase
      .from("availability_slots")
      .update({ status: "BOOKED" })
      .eq("id", order.slot_id);
  }

  // Log status change
  await supabase.from("order_status_logs").insert({
    order_id: orderId,
    from_status: "PROOF_SUBMITTED",
    to_status: "CONFIRMED",
    actor_id: user.id,
    note: "Photographer confirmed payment",
  });

  // Send booking confirmation email to student
  try {
    const slot = order.availability_slots as { slot_date: string; start_time: string; end_time: string } | null;
    const student = order.profiles as { full_name: string; email?: string } | null;

    if (student?.email && slot) {
      const photographerProfile = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", order.photographer_id)
        .single();

      await sendBookingConfirmation({
        studentEmail: student.email,
        studentName: student.full_name,
        photographerName: photographerProfile.data?.full_name || "摄影师",
        bookingId: order.order_no,
        shootDate: slot.slot_date,
        shootTime: `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
        meetingPoint: "请与摄影师确认",
        packageName: "毕业照拍摄",
        duration: `${Math.round((new Date(`1970-01-01T${slot.end_time}`).getTime() - new Date(`1970-01-01T${slot.start_time}`).getTime()) / 60000)} 分钟`,
        deliverables: "精修照片",
      });
    }
  } catch (emailError) {
    console.error("Failed to send booking confirmation email:", emailError);
  }

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
    .select("commission_owed_pence, full_name")
    .eq("id", order.photographer_id)
    .single();

  if (profile && (profile.commission_owed_pence ?? 0) > COMMISSION_THRESHOLD_PENCE) {
    await supabase
      .from("profiles")
      .update({ account_status: "SUSPENDED" })
      .eq("id", order.photographer_id);

    try {
      await sendCommissionSuspension({
        photographerEmail: user.email || "photographer@snapgown.placeholder",
        photographerName: profile.full_name || "摄影师",
        outstandingCommission: penceToPounds(profile.commission_owed_pence ?? 0),
      });
    } catch {
      console.error("Failed to send commission suspension email");
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
  if (order.slot_id) {
    await supabase
      .from("availability_slots")
      .update({ status: "AVAILABLE", hold_expires_at: null })
      .eq("id", order.slot_id);
  }

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

  const stats = await getOrderStatusCounts(supabase);

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

// === Admin: Photographer Management ===

async function verifyAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") throw new Error("Admin access required");
  return { supabase, user };
}

export async function adminApprovePhotographer(
  photographerId: string,
  status: "APPROVED" | "REJECTED"
) {
  await verifyAdmin();
  const admin = createSupabaseAdmin();

  const { error } = await admin
    .from("profiles")
    .update({ approval_status: status })
    .eq("id", photographerId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function adminSuspendPhotographer(
  photographerId: string,
  suspend: boolean
) {
  await verifyAdmin();
  const admin = createSupabaseAdmin();

  const { error } = await admin
    .from("profiles")
    .update({ account_status: suspend ? "SUSPENDED" : "ACTIVE" })
    .eq("id", photographerId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function adminClearDebt(photographerId: string) {
  await verifyAdmin();
  const admin = createSupabaseAdmin();

  const { error } = await admin
    .from("profiles")
    .update({ commission_owed_pence: 0, account_status: "ACTIVE" })
    .eq("id", photographerId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// === Admin: Enhanced Stats ===

export async function getAdminStatsEnhanced() {
  const { supabase } = await verifyAdmin();

  const stats = await getOrderStatusCounts(supabase);

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

  // Recent orders (latest 5)
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      "id, order_no, payment_ref, status, total_amount_pence, created_at, student:profiles!user_id(full_name), photographer:profiles!photographer_id(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // Pending photographers (latest 5)
  const { data: pendingPhotographers } = await supabase
    .from("profiles")
    .select("id, full_name, wechat_id, updated_at")
    .eq("role", "PHOTOGRAPHER")
    .eq("approval_status", "PENDING")
    .order("updated_at", { ascending: false })
    .limit(5);

  // Total students
  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "STUDENT");

  // Total photographers
  const { count: totalPhotographers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "PHOTOGRAPHER");

  return {
    orderStats: stats,
    totalCommissionPence: totalCommission,
    pendingApprovals: pendingApprovals || 0,
    recentOrders: recentOrders || [],
    pendingPhotographers: pendingPhotographers || [],
    totalStudents: totalStudents || 0,
    totalPhotographers: totalPhotographers || 0,
  };
}

// === Admin: Commission Ledger ===

export async function getAdminCommissionLedger() {
  await verifyAdmin();
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("commission_ledger")
    .select(
      "*, photographer:profiles!photographer_id(full_name), order:orders(order_no, total_amount_pence)"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function adminSettleCommission(ledgerId: string) {
  const { user } = await verifyAdmin();
  const admin = createSupabaseAdmin();

  const { error } = await admin
    .from("commission_ledger")
    .update({
      ledger_status: "SETTLED",
      settled_at: new Date().toISOString(),
      settled_by: user.id,
    })
    .eq("id", ledgerId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function adminWaiveCommission(ledgerId: string) {
  const { user } = await verifyAdmin();
  const admin = createSupabaseAdmin();

  // Get the ledger entry to update photographer's debt
  const { data: ledger } = await admin
    .from("commission_ledger")
    .select("photographer_id, platform_fee_pence")
    .eq("id", ledgerId)
    .single();

  if (!ledger) throw new Error("Ledger entry not found");

  // Mark as waived
  const { error } = await admin
    .from("commission_ledger")
    .update({
      ledger_status: "WAIVED",
      settled_at: new Date().toISOString(),
      settled_by: user.id,
      note: "Waived by admin",
    })
    .eq("id", ledgerId);

  if (error) throw new Error(error.message);

  // Decrease photographer's commission_owed
  await admin.rpc("increment_commission_owed", {
    target_photographer_id: ledger.photographer_id,
    amount_pence: -ledger.platform_fee_pence,
  });

  return { success: true };
}

// === Admin: Students ===

export async function getAdminStudents() {
  await verifyAdmin();
  const supabase = await createSupabaseServer();

  const { data: students, error } = await supabase
    .from("profiles")
    .select("id, full_name, wechat_id, uk_phone, updated_at")
    .eq("role", "STUDENT")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Get order stats for each student
  const studentsWithStats = await Promise.all(
    (students || []).map(async (s) => {
      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", s.id);

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount_pence")
        .eq("user_id", s.id)
        .eq("status", "COMPLETED");

      const totalSpent = (orders || []).reduce(
        (sum, o) => sum + o.total_amount_pence,
        0
      );

      return {
        ...s,
        orderCount: orderCount || 0,
        totalSpentPence: totalSpent,
      };
    })
  );

  return studentsWithStats;
}
