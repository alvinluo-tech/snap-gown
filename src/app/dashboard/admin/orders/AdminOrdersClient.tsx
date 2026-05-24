"use client";

import { useState } from "react";
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
import { CheckCircle, XCircle, Eye } from "lucide-react";

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

export function AdminOrdersClient({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const handleConfirm = async (orderId: string) => {
    setLoading(true);
    try {
      await adminConfirmOrder(orderId);
      toast.success("Order confirmed by admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedOrderId) return;
    setLoading(true);
    try {
      await adminRejectOrder(selectedOrderId, rejectReason);
      toast.success("Order rejected and slot released");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedOrderId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "VERIFICATION_OVERDUE":
        return "destructive";
      case "PROOF_SUBMITTED":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Filter: show overdue and proof_submitted first
  const urgentOrders = orders.filter(
    (o) => o.status === "VERIFICATION_OVERDUE" || o.status === "PROOF_SUBMITTED"
  );
  const otherOrders = orders.filter(
    (o) => o.status !== "VERIFICATION_OVERDUE" && o.status !== "PROOF_SUBMITTED"
  );

  const renderOrderTable = (orderList: AdminOrder[], title: string) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {orderList.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Payment Ref</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Photographer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Actions</TableHead>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {renderOrderTable(urgentOrders, "Urgent (Needs Action)")}
      {renderOrderTable(otherOrders, "All Other Orders")}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              This will cancel the order and release the slot. Provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
            >
              Reject & Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proof Dialog */}
      <Dialog open={!!viewProofUrl} onOpenChange={() => setViewProofUrl(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {viewProofUrl && (
            <img src={viewProofUrl} alt="Payment proof" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
