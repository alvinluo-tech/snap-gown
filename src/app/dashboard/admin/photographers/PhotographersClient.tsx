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
import COPY from "@/lib/constants/copy";

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
      toast.success(status === "APPROVED" ? COPY.ADMIN.PHOTOGRAPHER_APPROVED : COPY.ADMIN.PHOTOGRAPHER_REJECTED);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.COMMON.FAILED);
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
      title: suspend ? COPY.ADMIN.SUSPEND_DIALOG_TITLE : COPY.ADMIN.UNSUSPEND_DIALOG_TITLE,
      description: suspend
        ? COPY.ADMIN.SUSPEND_DIALOG_DESC
        : COPY.ADMIN.UNSUSPEND_DIALOG_DESC,
      action: async () => {
        setLoading(true);
        try {
          await adminSuspendPhotographer(photographerId, suspend);
          toast.success(suspend ? COPY.ADMIN.ACCOUNT_SUSPENDED : COPY.ADMIN.ACCOUNT_REACTIVATED);
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : COPY.COMMON.FAILED);
        }
        setLoading(false);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleClearDebt = (photographerId: string) => {
    setConfirmDialog({
      open: true,
      title: COPY.ADMIN.CLEAR_DEBT_DIALOG_TITLE,
      description:
        COPY.ADMIN.CLEAR_DEBT_DIALOG_DESC,
      action: async () => {
        setLoading(true);
        try {
          await adminClearDebt(photographerId);
          toast.success(COPY.ADMIN.DEBT_CLEARED);
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : COPY.COMMON.FAILED);
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
          placeholder={COPY.ADMIN.SEARCH_PHOTOGRAPHERS}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            {COPY.ADMIN.PENDING_APPROVAL} ({pendingPhotographers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPhotographers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {COPY.ADMIN.NO_PHOTOGRAPHERS_PENDING}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{COPY.COMMON.NAME}</TableHead>
                  <TableHead>{COPY.COMMON.WECHAT}</TableHead>
                  <TableHead>{COPY.COMMON.PHONE}</TableHead>
                  <TableHead>简介</TableHead>
                  <TableHead>{COPY.COMMON.ACTIONS}</TableHead>
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
                          {COPY.ADMIN.APPROVE}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(p.id, "REJECTED")}
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {COPY.ADMIN.REJECT}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Photographers */}
      <Card>
        <CardHeader>
          <CardTitle>{COPY.ADMIN.ALL_PHOTOGRAPHERS}</CardTitle>
        </CardHeader>
        <CardContent>
          {otherPhotographers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {search
                ? COPY.ADMIN.NO_PHOTOGRAPHERS_MATCH
                : COPY.ADMIN.NO_PHOTOGRAPHERS_REGISTERED}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{COPY.COMMON.NAME}</TableHead>
                  <TableHead>{COPY.COMMON.WECHAT}</TableHead>
                  <TableHead>{COPY.ADMIN.APPROVAL}</TableHead>
                  <TableHead>{COPY.ADMIN.ACCOUNT}</TableHead>
                  <TableHead>{COPY.ADMIN.DEBT}</TableHead>
                  <TableHead>{COPY.COMMON.ACTIONS}</TableHead>
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
                              {COPY.ADMIN.UNSUSPEND}
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-1" />
                              {COPY.ADMIN.SUSPEND}
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
                            {COPY.ADMIN.CLEAR_DEBT}
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
              {COPY.COMMON.CANCEL}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDialog.action}
              disabled={loading}
            >
              {COPY.COMMON.CONFIRM}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
