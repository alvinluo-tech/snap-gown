import { getAdminStatsEnhanced } from "@/app/actions/verification";
import { penceToPounds } from "@/lib/utils";
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
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
  Camera,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import COPY from "@/lib/constants/copy";

export default async function AdminOverviewPage() {
  let stats;
  try {
    stats = await getAdminStatsEnhanced();
  } catch {
    return (
      <div className="text-center py-20 border border-dashed border-border/80 rounded-2xl bg-card">
        <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-destructive" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-muted-foreground">{COPY.ADMIN.FAILED_TO_LOAD}</p>
      </div>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return "default";
      case "CANCELLED":
      case "VERIFICATION_OVERDUE":
        return "destructive";
      case "PROOF_SUBMITTED":
        return "secondary";
      default:
        return "outline";
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
    <div className="space-y-10">
      
      {/* Title block */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
          {COPY.ADMIN.PLATFORM_OVERVIEW}
        </h1>
        <p className="text-xs text-muted-foreground">
          实时监控全站摄影师审核、订单微信账单状态以及平台营收数据
        </p>
      </div>

      {/* Stats Grid - Scholastic Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {[
          { title: COPY.ADMIN.PENDING_PAYMENT, value: stats.orderStats.PENDING_PAYMENT || 0, icon: Clock, color: "text-brand bg-brand/10" },
          { title: COPY.ADMIN.AWAITING_VERIFICATION, value: stats.orderStats.PROOF_SUBMITTED || 0, icon: ShoppingCart, color: "text-primary bg-primary/5" },
          { title: COPY.ADMIN.CONFIRMED, value: stats.orderStats.CONFIRMED || 0, icon: CheckCircle, color: "text-primary bg-primary/5" },
          { title: COPY.ADMIN.OVERDUE, value: stats.orderStats.VERIFICATION_OVERDUE || 0, icon: AlertTriangle, color: "text-destructive bg-destructive/10 animate-pulse" },
          { title: COPY.ADMIN.COMPLETED, value: stats.orderStats.COMPLETED || 0, icon: CheckCircle, color: "text-primary bg-primary/5" },
          { title: COPY.ADMIN.CANCELLED, value: stats.orderStats.CANCELLED || 0, icon: ShoppingCart, color: "text-muted-foreground bg-muted/60" },
        ].map((card) => (
          <Card key={card.title} className="hover-lift border border-border/80 bg-card rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
              <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-1.5 rounded-lg ${card.color}`}>
                <card.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-mono font-bold text-primary">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift border border-border/80 bg-card rounded-2xl relative p-1 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.COMMISSION_OWED}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <DollarSign className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-brand-foreground">
              £{penceToPounds(stats.totalCommissionPence)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 block">未付平台佣金债务总计</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card rounded-2xl relative p-1 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.PENDING_APPROVALS}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
              <Users className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-primary">{stats.pendingApprovals}</div>
            <Link href="/dashboard/admin/photographers">
              <Button variant="link" size="sm" className="px-0 mt-1 h-auto text-xs text-brand font-semibold hover:text-brand-foreground">
                {COPY.ADMIN.REVIEW_NOW} <ArrowRight className="h-3 w-3 ml-1" strokeWidth={2} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card rounded-2xl p-1 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.TOTAL_STUDENTS}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <Users className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-primary">{stats.totalStudents}</div>
            <p className="text-[10px] text-muted-foreground mt-1 block">已注册学生账号数</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card rounded-2xl p-1 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.TOTAL_PHOTOGRAPHERS}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <Camera className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-primary">{stats.totalPhotographers}</div>
            <p className="text-[10px] text-muted-foreground mt-1 block">已入驻独立摄影师数</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Pending Photographers Grid lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-base font-serif italic font-bold text-primary">
              {COPY.ADMIN.RECENT_ORDERS}
            </CardTitle>
            <Link href="/dashboard/admin/orders">
              <Button variant="ghost" size="sm" className="tactile-btn text-xs font-semibold hover:bg-muted text-brand">
                {COPY.COMMON.VIEW_ALL} <ArrowRight className="h-3.5 w-3.5 ml-1" strokeWidth={1.75} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-xs p-8 text-center">{COPY.ADMIN.NO_ORDERS_YET}</p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-serif italic font-bold text-primary pl-6">{COPY.COMMON.ORDER}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.STUDENT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.AMOUNT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary pr-6">{COPY.COMMON.STATUS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats.recentOrders as unknown as Array<{ id: string; order_no: string; status: string; total_amount_pence: number; student: { full_name: string } | null }>).map(
                    (order) => {
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-mono text-xs font-semibold text-muted-foreground pl-6">
                            {order.order_no}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-primary">{order.student?.full_name || "-"}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-primary">
                            £{penceToPounds(order.total_amount_pence)}
                          </TableCell>
                          <TableCell className="pr-6">
                            <Badge variant={statusVariant(order.status)} className="text-[9px] font-semibold rounded-md">
                              {translateStatus(order.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pending Photographers */}
        <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-base font-serif italic font-bold text-primary">
              {COPY.ADMIN.PENDING_PHOTOGRAPHERS}
            </CardTitle>
            <Link href="/dashboard/admin/photographers">
              <Button variant="ghost" size="sm" className="tactile-btn text-xs font-semibold hover:bg-muted text-brand">
                {COPY.COMMON.VIEW_ALL} <ArrowRight className="h-3.5 w-3.5 ml-1" strokeWidth={1.75} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {stats.pendingPhotographers.length === 0 ? (
              <p className="text-muted-foreground text-xs p-8 text-center">
                {COPY.ADMIN.NO_PENDING_APPROVALS}
              </p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-serif italic font-bold text-primary pl-6">{COPY.COMMON.NAME}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.WECHAT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary pr-6">{COPY.COMMON.ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats.pendingPhotographers as unknown as Array<{ id: string; full_name: string; wechat_id: string }>).map(
                    (p) => (
                      <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-semibold text-xs text-primary pl-6">
                          {p.full_name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{p.wechat_id}</TableCell>
                        <TableCell className="pr-6">
                          <Link href="/dashboard/admin/photographers">
                            <Button size="sm" variant="outline" className="tactile-btn h-8 text-[11px] font-semibold border-brand/20 text-brand hover:bg-brand/5">
                              {COPY.ADMIN.REVIEW}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
