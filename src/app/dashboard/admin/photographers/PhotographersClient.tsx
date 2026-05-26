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

  const translateApproval = (status: string | null) => {
    if (status === "APPROVED") return "已批准";
    if (status === "PENDING") return "待审核";
    if (status === "REJECTED") return "已拒绝";
    return status || "";
  };

  const translateAccount = (status: string | null) => {
    if (status === "ACTIVE") return "活跃";
    if (status === "SUSPENDED") return "已暂停";
    return status || "";
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
          {COPY.ADMIN.PHOTOGRAPHERS}
        </h1>
        <p className="text-xs text-muted-foreground">
          审核新加入的摄影师申请，并管理已签约摄影师的佣金账单状态
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder={COPY.ADMIN.SEARCH_PHOTOGRAPHERS}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10.5 rounded-xl border-border/85 bg-card/60 focus:bg-card transition-colors h-10 text-xs"
        />
      </div>

      {/* Pending Approvals Card */}
      <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-xs bg-card">
        <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
          <CardTitle className="text-base font-serif italic font-bold text-primary flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-brand" strokeWidth={1.5} />
            {COPY.ADMIN.PENDING_APPROVAL} ({pendingPhotographers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingPhotographers.length === 0 ? (
            <p className="text-muted-foreground text-xs p-10 text-center">
              {COPY.ADMIN.NO_PHOTOGRAPHERS_PENDING}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-serif italic font-bold text-primary pl-8">{COPY.COMMON.NAME}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.WECHAT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.PHONE}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">个人简介</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary pr-8">{COPY.COMMON.ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPhotographers.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-semibold text-xs text-primary pl-8">{p.full_name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.wechat_id}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.uk_phone || "-"}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {p.bio || "-"}
                      </TableCell>
                      <TableCell className="pr-8">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="tactile-btn text-xs font-semibold bg-brand text-brand-foreground hover:bg-brand/90"
                            onClick={() => handleApproval(p.id, "APPROVED")}
                            disabled={loading}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                            {COPY.ADMIN.APPROVE}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="tactile-btn text-xs font-semibold bg-destructive hover:bg-destructive/90"
                            onClick={() => handleApproval(p.id, "REJECTED")}
                            disabled={loading}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
                            {COPY.ADMIN.REJECT}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Photographers Card */}
      <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-xs bg-card">
        <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
          <CardTitle className="text-base font-serif italic font-bold text-primary">
            {COPY.ADMIN.ALL_PHOTOGRAPHERS} ({otherPhotographers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {otherPhotographers.length === 0 ? (
            <p className="text-muted-foreground text-xs p-10 text-center">
              {search
                ? COPY.ADMIN.NO_PHOTOGRAPHERS_MATCH
                : COPY.ADMIN.NO_PHOTOGRAPHERS_REGISTERED}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-serif italic font-bold text-primary pl-8">{COPY.COMMON.NAME}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.WECHAT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.ADMIN.APPROVAL}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.ADMIN.ACCOUNT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.ADMIN.DEBT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary pr-8">{COPY.COMMON.ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherPhotographers.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-semibold text-xs text-primary pl-8">{p.full_name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.wechat_id}</TableCell>
                      <TableCell>
                        <Badge
                          className="text-[9px] font-semibold tracking-wider rounded-md uppercase"
                          variant={p.approval_status === "APPROVED" ? "default" : "destructive"}
                        >
                          {translateApproval(p.approval_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-[9px] font-semibold tracking-wider rounded-md uppercase"
                          variant={p.account_status === "ACTIVE" ? "default" : "destructive"}
                        >
                          {translateAccount(p.account_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        £{penceToPounds(p.commission_owed_pence)}
                      </TableCell>
                      <TableCell className="pr-8">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="tactile-btn text-xs font-semibold h-8 border-border/80 hover:bg-muted"
                            onClick={() =>
                              handleToggleSuspension(p.id, p.account_status)
                            }
                            disabled={loading}
                          >
                            {p.account_status === "SUSPENDED" ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 mr-1 text-brand" strokeWidth={1.5} />
                                {COPY.ADMIN.UNSUSPEND}
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5 mr-1 text-destructive" strokeWidth={1.5} />
                                {COPY.ADMIN.SUSPEND}
                              </>
                            )}
                          </Button>
                          {p.commission_owed_pence > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="tactile-btn text-xs font-semibold h-8 border-brand/20 text-brand hover:bg-brand/5"
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog Overhaul */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif italic font-bold text-lg text-primary">{confirmDialog.title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              className="tactile-btn text-xs font-semibold"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
            >
              {COPY.COMMON.CANCEL}
            </Button>
            <Button
              variant="destructive"
              className="tactile-btn text-xs font-semibold bg-destructive hover:bg-destructive/90"
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
