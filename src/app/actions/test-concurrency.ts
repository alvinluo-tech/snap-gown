import { createSupabaseAdmin } from '@/lib/supabase-server';

export async function runConcurrencyTest(targetSlotId: string) {
  const supabase = createSupabaseAdmin();
  console.log('🚀 正在启动杜伦试点系统高并发超卖冲击测试...');

  // 模拟两个中国留学生在微信群内，同时点击秒杀同一个毕业照时间槽
  const promise1 = supabase.rpc('hold_slot_for_payment', { p_slot_id: targetSlotId, p_order_no: 'TEST-ORD-A', p_payment_ref: 'D-AAAA' });
  const promise2 = supabase.rpc('hold_slot_for_payment', { p_slot_id: targetSlotId, p_order_no: 'TEST-ORD-B', p_payment_ref: 'D-BBBB' });

  const [res1, res2] = await Promise.all([promise1, promise2]);

  console.log('结果 A:', res1.error ? `拦截抢单失败: ${res1.error.message}` : '✅ 抢单占位成功');
  console.log('结果 B:', res2.error ? `拦截抢单失败: ${res2.error.message}` : '✅ 抢单占位成功');

  // 预期：结果 A 和 结果 B 必然有且只有一个成功，绝不可能双重创建订单。
}
