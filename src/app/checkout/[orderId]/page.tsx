import { createSupabaseServer } from "@/lib/supabase-server";
import { penceToPounds, penceToRMB } from "@/lib/utils";
import { CheckoutClient } from "./CheckoutClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { orderId } = await params;
  const supabase = await createSupabaseServer();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "*, availability_slots(slot_date, start_time, end_time), profiles!photographer_id(full_name, wechat_qr_url)"
    )
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const photographer = order.profiles as unknown as {
    full_name: string;
    wechat_qr_url: string | null;
  };

  return (
    <CheckoutClient
      order={{
        id: order.id,
        order_no: order.order_no,
        payment_ref: order.payment_ref,
        status: order.status,
        total_amount_pence: order.total_amount_pence,
        payment_proof_url: order.payment_proof_url,
      }}
      photographer={photographer}
      slot={order.availability_slots as unknown as { slot_date: string; start_time: string; end_time: string }}
      amountGBP={penceToPounds(order.total_amount_pence)}
      amountRMB={penceToRMB(order.total_amount_pence)}
    />
  );
}
