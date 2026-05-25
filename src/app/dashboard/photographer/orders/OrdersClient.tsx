"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  confirmPayment,
  rejectPayment,
  completeOrder,
} from "@/app/actions/verification";
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
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import COPY from "@/lib/constants/copy";

interface OrderWithRelations {
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
  profiles: {
    full_name: string;
    wechat_id: string;
    uk_phone: string | null;
  };
}

export function PhotographerOrdersClient({
  orders,
}: {
  orders: OrderWithRelations[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const handleConfirm = async (orderId: string) => {
    setLoading(true);
    try {
      await confirmPayment(orderId);
      toast.success(COPY.PHOTOGRAPHER_DASHBOARD.PAYMENT_CONFIRMED);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.PHOTOGRAPHER_DASHBOARD.CONFIRM_FAILED);
    }
    setLoading(false);
  };

  const handleComplete = async (orderId: string) => {
    setLoading(true);
    try {
      await completeOrder(orderId);
      toast.success(COPY.PHOTOGRAPHER_DASHBOARD.ORDER_COMPLETED);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.PHOTOGRAPHER_DASHBOARD.COMPLETE_FAILED);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedOrderId) return;
    setLoading(true);
    try {
      await rejectPayment(selectedOrderId, rejectReason);
      toast.success(COPY.PHOTOGRAPHER_DASHBOARD.PAYMENT_REJECTED);
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedOrderId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.PHOTOGRAPHER_DASHBOARD.REJECT_FAILED);
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{COPY.PHOTOGRAPHER_DASHBOARD.ORDER_MANAGEMENT}</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{COPY.PHOTOGRAPHER_DASHBOARD.NO_ORDERS}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.ORDER}</TableHead>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.PAYMENT_REF}</TableHead>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.STUDENT}</TableHead>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.DATE}</TableHead>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.AMOUNT}</TableHead>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.STATUS}</TableHead>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.PROOF}</TableHead>
                  <TableHead>{COPY.PHOTOGRAPHER_DASHBOARD.ACTIONS}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.order_no}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {order.payment_ref}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.profiles?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {COPY.PHOTOGRAPHER_DASHBOARD.WECHAT_LABEL}{order.profiles?.wechat_id}
                        </p>
                      </div>
                    </TableCell>
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
                          onClick={() =>
                            setViewProofUrl(order.payment_proof_url)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.status === "PROOF_SUBMITTED" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(order.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {COPY.PHOTOGRAPHER_DASHBOARD.CONFIRM_PAYMENT}
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
                            {COPY.PHOTOGRAPHER_DASHBOARD.REJECT_PAYMENT}
                          </Button>
                        </div>
                      )}
                      {order.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          onClick={() => handleComplete(order.id)}
                          disabled={loading}
                        >
                          {COPY.PHOTOGRAPHER_DASHBOARD.MARK_COMPLETE}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{COPY.PHOTOGRAPHER_DASHBOARD.REJECT_DIALOG_TITLE}</DialogTitle>
            <DialogDescription>
              {COPY.PHOTOGRAPHER_DASHBOARD.REJECT_DIALOG_DESC}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={COPY.PHOTOGRAPHER_DASHBOARD.REJECT_REASON_PLACEHOLDER}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              {COPY.COMMON.CANCEL}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
            >
              {COPY.PHOTOGRAPHER_DASHBOARD.REJECT_AND_RELEASE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proof Dialog */}
      <Dialog
        open={!!viewProofUrl}
        onOpenChange={() => setViewProofUrl(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.PHOTOGRAPHER_DASHBOARD.VIEW_PROOF}</DialogTitle>
          </DialogHeader>
          {viewProofUrl && (
            <img
              src={viewProofUrl}
              alt={COPY.COMPONENTS.PROOF_PREVIEW_ALT}
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
