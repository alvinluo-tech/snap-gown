import { createSupabaseServer } from "@/lib/supabase-server";
import { penceToPounds, penceToRMB } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Camera, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your bookings.</p>
        <Link href="/auth">
          <Button className="ml-3">Login</Button>
        </Link>
      </div>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "*, availability_slots(slot_date, start_time, end_time, school_slug), profiles!photographer_id(full_name, wechat_id)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const statusVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "VERIFICATION_OVERDUE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">My Bookings</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Waiting copy for proof submitted */}
            {orders?.some((o) => o.status === "PROOF_SUBMITTED") && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-blue-800 text-sm">
                    您的付款凭证已成功提交。当前档期已为您安全锁定。摄影师正为您核对账单中（最长不超过12小时）。若超时未处理，平台官方客服将直接介入协助，请您放心。
                  </p>
                </div>
              </div>
            )}

            {!orders || orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">No bookings yet.</p>
                <Link href="/">
                  <Button>Browse Photographers</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order No</TableHead>
                    <TableHead>Payment Ref</TableHead>
                    <TableHead>Photographer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const slot = order.availability_slots as unknown as {
                      slot_date: string;
                      start_time: string;
                      end_time: string;
                    };
                    const photographer = order.profiles as unknown as {
                      full_name: string;
                    };

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.order_no}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {order.payment_ref}
                          </Badge>
                        </TableCell>
                        <TableCell>{photographer?.full_name}</TableCell>
                        <TableCell>{slot?.slot_date}</TableCell>
                        <TableCell>
                          {slot?.start_time?.slice(0, 5)} -{" "}
                          {slot?.end_time?.slice(0, 5)}
                        </TableCell>
                        <TableCell>
                          £{penceToPounds(order.total_amount_pence)}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            ¥{penceToRMB(order.total_amount_pence)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.status)}>
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status === "PENDING_PAYMENT" && (
                            <Link href={`/checkout/${order.id}`}>
                              <Button size="sm">Pay Now</Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
