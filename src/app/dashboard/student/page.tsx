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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import COPY from "@/lib/constants/copy";

export default async function StudentDashboard() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 academic-grain text-center space-y-4">
        <p className="text-sm text-muted-foreground">{COPY.STUDENT.LOGIN_TO_VIEW}</p>
        <Link href="/auth">
          <Button className="tactile-btn bg-brand text-brand-foreground hover:bg-brand/90 font-semibold shadow-sm">{COPY.COMMON.LOGIN}</Button>
        </Link>
      </div>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "*, availability_slots(slot_date, start_time, end_time, school_slug, hold_expires_at), profiles!photographer_id(full_name, wechat_id)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const statusVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return "default";
      case "CANCELLED":
      case "VERIFICATION_OVERDUE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "待支付";
      case "PROOF_SUBMITTED":
        return "核对中";
      case "CONFIRMED":
        return "已确认";
      case "VERIFICATION_OVERDUE":
        return "核对超期";
      case "COMPLETED":
        return "已完成";
      case "CANCELLED":
        return "已取消";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain pb-24">
      {/* Decorative top background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="tactile-btn rounded-xl hover:bg-muted text-foreground">
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </Link>
          <Camera className="h-5 w-5 text-brand" strokeWidth={1.5} />
          <span className="text-xl font-serif italic font-semibold text-primary">{COPY.STUDENT.MY_BOOKINGS}</span>
          <Badge variant="outline" className="ml-auto border-brand/20 text-brand bg-brand/5 text-[9px] uppercase tracking-widest px-2.5">
            Student Account
          </Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-8">
        
        {/* Title Group */}
        <div className="space-y-1">
          <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
            {COPY.STUDENT.BOOKING_HISTORY}
          </h1>
          <p className="text-xs text-muted-foreground">
            管理您预约的所有毕业照拍摄日程与微信账单核对进度
          </p>
        </div>

        {/* Info alerts */}
        {orders?.some((o) => o.status === "PROOF_SUBMITTED") && (
          <Card className="border-brand/25 bg-brand-light/10 rounded-2xl shadow-xs">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand animate-pulse mt-0.5">
                <Clock className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm text-brand-foreground dark:text-brand">
                  付款凭证待摄影师核对中
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[90ch]">
                  {COPY.STUDENT.PROOF_SUBMITTED_NOTICE}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard table card wrapper */}
        <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-sm bg-card">
          <CardContent className="p-0">
            {!orders || orders.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground space-y-4">
                <p className="text-sm font-semibold">{COPY.STUDENT.NO_BOOKINGS}</p>
                <Link href="/">
                  <Button className="tactile-btn bg-brand text-brand-foreground hover:bg-brand/90 font-semibold shadow-xs">
                    {COPY.STUDENT.BROWSE_PHOTOGRAPHERS}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30 border-b border-border/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-serif italic font-bold text-primary pl-8">{COPY.STUDENT.ORDER_NO}</TableHead>
                      <TableHead className="font-serif italic font-bold text-primary">{COPY.STUDENT.PAYMENT_REF}</TableHead>
                      <TableHead className="font-serif italic font-bold text-primary">{COPY.STUDENT.PHOTOGRAPHER}</TableHead>
                      <TableHead className="font-serif italic font-bold text-primary">{COPY.STUDENT.DATE}</TableHead>
                      <TableHead className="font-serif italic font-bold text-primary">{COPY.STUDENT.TIME}</TableHead>
                      <TableHead className="font-serif italic font-bold text-primary">{COPY.STUDENT.AMOUNT}</TableHead>
                      <TableHead className="font-serif italic font-bold text-primary">{COPY.STUDENT.STATUS}</TableHead>
                      <TableHead className="font-serif italic font-bold text-primary pr-8">{COPY.STUDENT.ACTION}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const slot = order.availability_slots as unknown as {
                        slot_date: string;
                        start_time: string;
                        end_time: string;
                        hold_expires_at: string | null;
                      };
                      const photographer = order.profiles as unknown as {
                        full_name: string;
                        avatar_url: string | null;
                      };

                      return (
                        <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-mono text-xs font-semibold text-muted-foreground pl-8">
                            {order.order_no}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs border-brand/20 bg-brand/5 text-brand px-2 py-0">
                              {order.payment_ref}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar size="sm" className="border border-brand/20 shadow-xs h-8 w-8">
                                {photographer?.avatar_url ? (
                                  <AvatarImage src={photographer.avatar_url} alt={photographer.full_name} />
                                ) : null}
                                <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold">
                                  {photographer?.full_name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm text-primary">
                                {photographer?.full_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-primary">{slot?.slot_date}</TableCell>
                          <TableCell className="text-sm font-semibold text-primary">
                            {slot?.start_time?.slice(0, 5)} -{" "}
                            {slot?.end_time?.slice(0, 5)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono font-bold text-primary">
                              £{penceToPounds(order.total_amount_pence)}
                            </span>
                            <br />
                            <span className="text-[10px] font-mono text-muted-foreground">
                              ¥{penceToRMB(order.total_amount_pence)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(order.status)} className="text-[10px] font-semibold uppercase tracking-wider rounded-md">
                              {translateStatus(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-8">
                            {order.status === "PENDING_PAYMENT" && (() => {
                              const expired = slot?.hold_expires_at
                                ? new Date(slot.hold_expires_at).getTime() <= Date.now()
                                : false;
                              if (expired) {
                                return (
                                  <span className="text-xs text-destructive font-semibold">已过期</span>
                                );
                              }
                              const remaining = slot?.hold_expires_at
                                ? Math.max(0, Math.floor((new Date(slot.hold_expires_at).getTime() - Date.now()) / 1000))
                                : null;
                              return (
                                <div className="flex items-center gap-2">
                                  <Link href={`/checkout/${order.id}`}>
                                    <Button size="sm" className="tactile-btn text-xs font-semibold bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm shadow-brand/10">
                                      {COPY.STUDENT.PAY_NOW}
                                    </Button>
                                  </Link>
                                  {remaining !== null && (
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
