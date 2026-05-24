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

interface OrderWithRelations {
  id: string;
  order_no: string;
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
      toast.success("Payment confirmed! Booking is now active.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Confirm failed");
    }
    setLoading(false);
  };

  const handleComplete = async (orderId: string) => {
    setLoading(true);
    try {
      await completeOrder(orderId);
      toast.success("Order marked as completed!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Complete failed");
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedOrderId) return;
    setLoading(true);
    try {
      await rejectPayment(selectedOrderId, rejectReason);
      toast.success("Payment rejected. Student will be notified.");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedOrderId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reject failed");
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
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No orders yet. Create time slots to start receiving bookings!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.order_no}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.profiles?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          WeChat: {order.profiles?.wechat_id}
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
                            Confirm
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
                            Reject
                          </Button>
                        </div>
                      )}
                      {order.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          onClick={() => handleComplete(order.id)}
                          disabled={loading}
                        >
                          Mark Complete
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
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment proof.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
            >
              Reject Payment
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
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {viewProofUrl && (
            <img
              src={viewProofUrl}
              alt="Payment proof"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
