"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminApprovePhotographer,
  adminSuspendPhotographer,
  adminClearDebt,
} from "@/app/actions/verification";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Ban, Check, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PhotographerProfile {
  id: string;
  full_name: string;
  wechat_id: string;
  uk_phone: string | null;
  bio: string | null;
  approval_status: string | null;
  account_status: string | null;
  commission_owed_pence: number;
  gowns_json: unknown;
  created_at: string | null;
}

export function PhotographersClient({
  photographers,
}: {
  photographers: PhotographerProfile[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });

  const handleApproval = async (
    photographerId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setLoading(true);
    try {
      await adminApprovePhotographer(photographerId, status);
      toast.success(`Photographer ${status.toLowerCase()}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  };

  const handleToggleSuspension = async (
    photographerId: string,
    currentStatus: string | null
  ) => {
    const suspend = currentStatus !== "SUSPENDED";
    setConfirmDialog({
      open: true,
      title: suspend ? "Suspend Photographer?" : "Unsuspend Photographer?",
      description: suspend
        ? "This will prevent the photographer from receiving new bookings."
        : "This will restore the photographer's ability to receive bookings.",
      action: async () => {
        setLoading(true);
        try {
          await adminSuspendPhotographer(photographerId, suspend);
          toast.success(`Account ${suspend ? "suspended" : "reactivated"}`);
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleClearDebt = (photographerId: string) => {
    setConfirmDialog({
      open: true,
      title: "Clear Debt?",
      description:
        "This will set the photographer's commission debt to £0.00 and reactivate their account.",
      action: async () => {
        setLoading(true);
        try {
          await adminClearDebt(photographerId);
          toast.success("Debt cleared and account reactivated");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const filtered = photographers.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.wechat_id.toLowerCase().includes(search.toLowerCase())
  );

  const pendingPhotographers = filtered.filter(
    (p) => p.approval_status === "PENDING"
  );
  const otherPhotographers = filtered.filter(
    (p) => p.approval_status !== "PENDING"
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or WeChat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Approvals */}
      {pendingPhotographers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Approval ({pendingPhotographers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>WeChat</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPhotographers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name}</TableCell>
                    <TableCell>{p.wechat_id}</TableCell>
                    <TableCell>{p.uk_phone || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {p.bio || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(p.id, "APPROVED")}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(p.id, "REJECTED")}
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Photographers */}
      <Card>
        <CardHeader>
          <CardTitle>All Photographers</CardTitle>
        </CardHeader>
        <CardContent>
          {otherPhotographers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {search
                ? "No photographers match your search."
                : "No photographers registered yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>WeChat</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Debt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherPhotographers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name}</TableCell>
                    <TableCell>{p.wechat_id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.approval_status === "APPROVED"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {p.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.account_status === "ACTIVE"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {p.account_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      £{penceToPounds(p.commission_owed_pence)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggleSuspension(p.id, p.account_status)
                          }
                          disabled={loading}
                        >
                          {p.account_status === "SUSPENDED" ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Unsuspend
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-1" />
                              Suspend
                            </>
                          )}
                        </Button>
                        {p.commission_owed_pence > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClearDebt(p.id)}
                            disabled={loading}
                          >
                            Clear Debt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDialog.action}
              disabled={loading}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
