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
import COPY from "@/lib/constants/copy";

export default async function StudentDashboard() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{COPY.STUDENT.LOGIN_TO_VIEW}</p>
        <Link href="/auth">
          <Button className="ml-3">{COPY.COMMON.LOGIN}</Button>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{COPY.STUDENT.MY_BOOKINGS}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{COPY.STUDENT.BOOKING_HISTORY}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Waiting copy for proof submitted */}
            {orders?.some((o) => o.status === "PROOF_SUBMITTED") && (
              <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-primary text-sm">
                    {COPY.STUDENT.PROOF_SUBMITTED_NOTICE}
                  </p>
                </div>
              </div>
            )}

            {!orders || orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">{COPY.STUDENT.NO_BOOKINGS}</p>
                <Link href="/">
                  <Button>{COPY.STUDENT.BROWSE_PHOTOGRAPHERS}</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{COPY.STUDENT.ORDER_NO}</TableHead>
                    <TableHead>{COPY.STUDENT.PAYMENT_REF}</TableHead>
                    <TableHead>{COPY.STUDENT.PHOTOGRAPHER}</TableHead>
                    <TableHead>{COPY.STUDENT.DATE}</TableHead>
                    <TableHead>{COPY.STUDENT.TIME}</TableHead>
                    <TableHead>{COPY.STUDENT.AMOUNT}</TableHead>
                    <TableHead>{COPY.STUDENT.STATUS}</TableHead>
                    <TableHead>{COPY.STUDENT.ACTION}</TableHead>
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
                              <Button size="sm">{COPY.STUDENT.PAY_NOW}</Button>
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
