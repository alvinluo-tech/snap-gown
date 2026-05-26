import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

// This endpoint is called via navigator.sendBeacon() when the user closes
// the checkout page without explicitly clicking "Cancel booking".
// sendBeacon fires POST with Content-Type text/plain, so we parse raw body.
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const { orderId } = JSON.parse(text) as { orderId?: string };
    if (!orderId) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    // Only cancel if still pending payment — safe to call multiple times
    const { data: order } = await supabase
      .from("orders")
      .select("id, slot_id, status, user_id")
      .eq("id", orderId)
      .eq("user_id", user.id) // ownership guard
      .single();

    if (!order || order.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Cancel order (user client for ownership check)
    await supabase
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", orderId);

    // Release slot (admin client bypasses RLS - student isn't slot owner)
    if (order.slot_id) {
      const admin = createSupabaseAdmin();
      await admin
        .from("availability_slots")
        .update({ status: "AVAILABLE", hold_expires_at: null })
        .eq("id", order.slot_id);
    }

    // Log
    await supabase.from("order_status_logs").insert({
      order_id: orderId,
      from_status: "PENDING_PAYMENT",
      to_status: "CANCELLED",
      actor_id: user.id,
      note: "Auto-cancelled: student left checkout page (sendBeacon)",
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never throw — beacon responses are ignored by the browser anyway
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
