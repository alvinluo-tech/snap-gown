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
import { CheckCircle, XCircle, Eye, Search } from "lucide-react";
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

  const renderOrderTable = (orderList: AdminOrder[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} ({orderList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orderList.length === 0 ? (
          <p className="text-muted-foreground text-sm">{COPY.ADMIN.NO_ORDERS_YET}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{COPY.COMMON.ORDER}</TableHead>
                  <TableHead>{COPY.CHECKOUT.PAYMENT_REF}</TableHead>
                  <TableHead>{COPY.COMMON.STUDENT}</TableHead>
                  <TableHead>{COPY.COMMON.PHOTOGRAPHER}</TableHead>
                  <TableHead>{COPY.COMMON.DATE}</TableHead>
                  <TableHead>{COPY.COMMON.AMOUNT}</TableHead>
                  <TableHead>{COPY.COMMON.STATUS}</TableHead>
                  <TableHead>{COPY.COMMON.PROOF}</TableHead>
                  <TableHead>{COPY.COMMON.ACTIONS}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderList.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.order_no}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {order.payment_ref}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.student?.full_name}</TableCell>
                    <TableCell>{order.photographer?.full_name}</TableCell>
                    <TableCell>
                      {order.availability_slots?.slot_date}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {order.availability_slots?.start_time?.slice(0, 5)} -{" "}
                        {order.availability_slots?.end_time?.slice(0, 5)}
                      </span>
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
                      {order.payment_proof_url ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewProofUrl(order.payment_proof_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(order.status === "PROOF_SUBMITTED" ||
                        order.status === "VERIFICATION_OVERDUE") && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(order.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {COPY.COMMON.CONFIRM}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setRejectDialogOpen(true);
                            }}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {COPY.ADMIN.REJECT}
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
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={COPY.ADMIN.SEARCH_ORDERS}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={COPY.ADMIN.FILTER_BY_STATUS} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "ALL" ? COPY.ADMIN.ALL_STATUSES : status.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {urgentOrders.length > 0 && renderOrderTable(urgentOrders, COPY.ADMIN.URGENT_ORDERS)}
      {renderOrderTable(otherOrders, COPY.ADMIN.ALL_ORDERS)}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{COPY.ADMIN.REJECT_ORDER}</DialogTitle>
            <DialogDescription>
              {COPY.ADMIN.REJECT_ORDER_DESC}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={COPY.ADMIN.REJECT_REASON_PLACEHOLDER}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {COPY.COMMON.CANCEL}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
            >
              {COPY.ADMIN.REJECT_AND_RELEASE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proof Dialog */}
      <Dialog open={!!viewProofUrl} onOpenChange={() => setViewProofUrl(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.ADMIN.PAYMENT_PROOF}</DialogTitle>
          </DialogHeader>
          {viewProofUrl && (
            <img src={viewProofUrl} alt={COPY.COMPONENTS.PROOF_PREVIEW_ALT} className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
