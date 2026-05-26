import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { CheckoutClient } from './CheckoutClient';
import COPY from '@/lib/constants/copy';
import { penceToPounds, penceToRMB } from '@/lib/utils';

interface CheckoutPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { orderId } = await params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from('orders')
    .select(`*, availability_slots(*), profiles!orders_photographer_id_fkey(full_name, wechat_id, wechat_qr_url)`)
    .eq('id', orderId)
    .single();

  if (!order || !user || order.user_id !== user.id) notFound();

  const amountGBP = penceToPounds(order.total_amount_pence);
  const amountCNY = penceToRMB(order.total_amount_pence);

  return (
    <main className="max-w-5xl mx-auto py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{COPY.BRAND.NAME} 收银台</h1>
        <p className="text-muted-foreground">订单号：{order.order_no}</p>
      </div>

      <CheckoutClient
        orderId={orderId}
        amountCNY={amountCNY}
        amountGBP={amountGBP}
        paymentRef={order.payment_ref}
        photographerQR={order.profiles.wechat_qr_url}
        photographerName={order.profiles.full_name}
      />
    </main>
  );
}
