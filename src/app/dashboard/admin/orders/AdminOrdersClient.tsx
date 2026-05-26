"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { adminConfirmOrder, adminRejectOrder } from "@/app/actions/verification";
import { penceToPounds, penceToRMB } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Search, AlertCircle } from "lucide-react";
import COPY from "@/lib/constants/copy";

interface AdminOrder {
  id: string;
  order_no: string;
  payment_ref: string;
  status: string;
  total_amount_pence: number;
  payment_proof_url: string | null;
  created_at: string | null;
  availability_slots: {
    slot_date: string;
    start_time: string;
    end_time: string;
  };
  student: { full_name: string; wechat_id: string };
  photographer: { full_name: string };
}

const STATUS_OPTIONS = [
  "ALL",
  "PENDING_PAYMENT",
  "PROOF_SUBMITTED",
  "CONFIRMED",
  "VERIFICATION_OVERDUE",
  "COMPLETED",
  "CANCELLED",
] as const;

export function AdminOrdersClient({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleConfirm = async (orderId: string) => {
    setLoading(true);
    try {
      await adminConfirmOrder(orderId);
      toast.success(COPY.ADMIN.ORDER_CONFIRMED);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.COMMON.FAILED);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedOrderId) return;
    setLoading(true);
    try {
      await adminRejectOrder(selectedOrderId, rejectReason);
      toast.success(COPY.ADMIN.ORDER_REJECTED);
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedOrderId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.COMMON.FAILED);
    }
    setLoading(false);
  };

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

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        o.order_no.toLowerCase().includes(search.toLowerCase()) ||
        o.payment_ref.toLowerCase().includes(search.toLowerCase()) ||
        o.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.photographer?.full_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const urgentOrders = filteredOrders.filter(
    (o) => o.status === "VERIFICATION_OVERDUE" || o.status === "PROOF_SUBMITTED"
  );
  const otherOrders = filteredOrders.filter(
    (o) => o.status !== "VERIFICATION_OVERDUE" && o.status !== "PROOF_SUBMITTED"
  );

  const renderOrderTable = (orderList: AdminOrder[], title: string, isUrgent: boolean = false) => (
    <Card className={`border rounded-[24px] overflow-hidden shadow-xs bg-card ${isUrgent ? "border-brand/30" : "border-border/80"}`}>
      <CardHeader className={`p-6 border-b border-border/40 flex flex-row items-center justify-between ${isUrgent ? "bg-brand-light/10" : "bg-muted/20"}`}>
        <CardTitle className="text-base font-serif italic font-bold text-primary flex items-center gap-2">
          {isUrgent && <AlertCircle className="h-4.5 w-4.5 text-brand animate-pulse" strokeWidth={2} />}
          {title} ({orderList.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orderList.length === 0 ? (
          <p className="text-muted-foreground text-xs p-10 text-center">{COPY.ADMIN.NO_ORDERS_YET}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-serif italic font-bold text-primary pl-8">{COPY.COMMON.ORDER}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary">{COPY.CHECKOUT.PAYMENT_REF}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.STUDENT}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.PHOTOGRAPHER}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.DATE}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.AMOUNT}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.STATUS}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.PROOF}</TableHead>
                  <TableHead className="font-serif italic font-bold text-primary pr-8">{COPY.COMMON.ACTIONS}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderList.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground pl-8">
                      {order.order_no}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs border-brand/20 bg-brand/5 text-brand px-2 py-0">
                        {order.payment_ref}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-primary">{order.student?.full_name}</TableCell>
                    <TableCell className="text-xs font-semibold text-primary">{order.photographer?.full_name}</TableCell>
                    <TableCell className="text-xs text-primary font-medium">
                      {order.availability_slots?.slot_date}
                      <br />
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {order.availability_slots?.start_time?.slice(0, 5)} -{" "}
                        {order.availability_slots?.end_time?.slice(0, 5)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono font-bold text-primary">
                        £{penceToPounds(order.total_amount_pence)}
                      </span>
                      <br />
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ¥{penceToRMB(order.total_amount_pence)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)} className="text-[9px] font-semibold rounded-md">
                        {translateStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.payment_proof_url ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-muted tactile-btn text-brand"
                          onClick={() => setViewProofUrl(order.payment_proof_url)}
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-8">
                      {(order.status === "PROOF_SUBMITTED" ||
                        order.status === "VERIFICATION_OVERDUE") && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="tactile-btn text-xs font-semibold bg-brand text-brand-foreground hover:bg-brand/90"
                            onClick={() => handleConfirm(order.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                            确认到账
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="tactile-btn text-xs font-semibold bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setRejectDialogOpen(true);
                            }}
                            disabled={loading}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
                            拒绝释放
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
          后台订单大厅
        </h1>
        <p className="text-xs text-muted-foreground">
          查看并检索系统上产生的所有毕业照片约拍订单，支持管理员强制干预及到账确认
        </p>
      </div>

      {/* Search and Select Filters */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder={COPY.ADMIN.SEARCH_ORDERS}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10.5 rounded-xl border-border/85 bg-card/60 focus:bg-card transition-colors h-10 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-border/85 h-10 text-xs font-medium bg-card">
            <SelectValue placeholder={COPY.ADMIN.FILTER_BY_STATUS} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {status === "ALL" ? COPY.ADMIN.ALL_STATUSES : translateStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lists */}
      {urgentOrders.length > 0 && renderOrderTable(urgentOrders, COPY.ADMIN.URGENT_ORDERS, true)}
      {renderOrderTable(otherOrders, COPY.ADMIN.ALL_ORDERS)}

      {/* Reject Dialog Overhaul */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif italic font-bold text-lg text-primary">{COPY.ADMIN.REJECT_ORDER}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {COPY.ADMIN.REJECT_ORDER_DESC}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={COPY.ADMIN.REJECT_REASON_PLACEHOLDER}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-xl border-border/85 focus:bg-card transition-all text-xs min-h-[80px]"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="tactile-btn text-xs font-semibold" onClick={() => setRejectDialogOpen(false)}>
              {COPY.COMMON.CANCEL}
            </Button>
            <Button
              variant="destructive"
              className="tactile-btn text-xs font-semibold bg-destructive hover:bg-destructive/90"
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
            >
              {COPY.ADMIN.REJECT_AND_RELEASE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proof Image Dialog Overhaul */}
      <Dialog open={!!viewProofUrl} onOpenChange={() => setViewProofUrl(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-border/80 shadow-2xl p-6 bg-card">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-serif italic font-bold text-lg text-primary">{COPY.ADMIN.PAYMENT_PROOF}</DialogTitle>
          </DialogHeader>
          {viewProofUrl && (
            <div className="relative rounded-xl overflow-hidden border border-border/60 bg-white p-2">
              <img src={viewProofUrl} alt={COPY.COMPONENTS.PROOF_PREVIEW_ALT} className="w-full rounded-lg object-contain max-h-[400px]" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
