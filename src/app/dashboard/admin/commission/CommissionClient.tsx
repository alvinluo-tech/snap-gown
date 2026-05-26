"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  adminSettleCommission,
  adminWaiveCommission,
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
import { toast } from "sonner";
import { CheckCircle, XCircle, Search, DollarSign, ListOrdered } from "lucide-react";
import COPY from "@/lib/constants/copy";

interface CommissionEntry {
  id: string;
  order_id: string;
  photographer_id: string;
  platform_fee_pence: number;
  ledger_status: string;
  settled_at: string | null;
  settled_by: string | null;
  note: string | null;
  created_at: string | null;
  photographer: { full_name: string } | null;
  order: { order_no: string; total_amount_pence: number } | null;
}

const STATUS_OPTIONS = ["ALL", "PENDING", "SETTLED", "WAIVED"] as const;

export function CommissionClient({ ledger }: { ledger: CommissionEntry[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });

  const handleSettle = (ledgerId: string) => {
    setConfirmDialog({
      open: true,
      title: COPY.ADMIN.SETTLE_DIALOG_TITLE,
      description:
        COPY.ADMIN.SETTLE_DIALOG_DESC,
      action: async () => {
        setLoading(true);
        try {
          await adminSettleCommission(ledgerId);
          toast.success(COPY.ADMIN.COMMISSION_SETTLED);
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : COPY.COMMON.FAILED);
        }
        setLoading(false);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleWaive = (ledgerId: string) => {
    setConfirmDialog({
      open: true,
      title: COPY.ADMIN.WAIVE_DIALOG_TITLE,
      description:
        COPY.ADMIN.WAIVE_DIALOG_DESC,
      action: async () => {
        setLoading(true);
        try {
          await adminWaiveCommission(ledgerId);
          toast.success(COPY.ADMIN.COMMISSION_WAIVED);
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : COPY.COMMON.FAILED);
        }
        setLoading(false);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "SETTLED":
        return "default";
      case "WAIVED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "待结算";
      case "SETTLED":
        return "已结算";
      case "WAIVED":
        return "已免除";
      default:
        return status;
    }
  };

  const filtered = useMemo(() => {
    return ledger.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.photographer?.full_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        entry.order?.order_no?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || entry.ledger_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [ledger, search, statusFilter]);

  const totalPending = ledger
    .filter((e) => e.ledger_status === "PENDING")
    .reduce((sum, e) => sum + e.platform_fee_pence, 0);

  const totalSettled = ledger
    .filter((e) => e.ledger_status === "SETTLED")
    .reduce((sum, e) => sum + e.platform_fee_pence, 0);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
          {COPY.ADMIN.COMMISSION_LEDGER}
        </h1>
        <p className="text-xs text-muted-foreground">
          查看并审核每笔拍摄订单收取的平台 10% 佣金结算与免除账目明细
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift border border-border/80 bg-card rounded-2xl overflow-hidden shadow-xs relative p-1">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.PENDING}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <DollarSign className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-brand-foreground">
              £{penceToPounds(totalPending)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card rounded-2xl overflow-hidden shadow-xs relative p-1">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.SETTLED}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
              <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-primary">
              £{penceToPounds(totalSettled)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card rounded-2xl p-1 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.TOTAL_ENTRIES}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <ListOrdered className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-primary">{ledger.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Select Filter */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder={COPY.ADMIN.SEARCH_COMMISSION}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10.5 rounded-xl border-border/85 bg-card/60 focus:bg-card transition-colors h-10 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-border/85 h-10 text-xs font-medium bg-card">
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

      {/* Table Card */}
      <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-xs bg-card">
        <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
          <CardTitle className="text-base font-serif italic font-bold text-primary">
            {COPY.ADMIN.COMMISSION_ENTRIES(filtered.length)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-xs p-10 text-center">
              {search || statusFilter !== "ALL"
                ? COPY.ADMIN.NO_ENTRIES_MATCH
                : COPY.ADMIN.NO_ENTRIES_YET}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-serif italic font-bold text-primary pl-8">{COPY.COMMON.ORDER}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.PHOTOGRAPHER}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.ADMIN.ORDER_AMOUNT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.ADMIN.COMMISSION_AMOUNT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.STATUS}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.DATE}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary pr-8">{COPY.COMMON.ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground pl-8">
                        {entry.order?.order_no || "-"}
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-primary">
                        {entry.photographer?.full_name || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        £{penceToPounds(entry.order?.total_amount_pence || 0)}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        £{penceToPounds(entry.platform_fee_pence)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-[9px] font-semibold tracking-wider rounded-md uppercase"
                          variant={statusVariant(entry.ledger_status)}
                        >
                          {translateStatus(entry.ledger_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="pr-8">
                        {entry.ledger_status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="tactile-btn text-xs font-semibold bg-brand text-brand-foreground hover:bg-brand/90"
                              onClick={() => handleSettle(entry.id)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                              {COPY.ADMIN.SETTLE}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="tactile-btn text-xs font-semibold h-8 border-border/80 hover:bg-muted"
                              onClick={() => handleWaive(entry.id)}
                              disabled={loading}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1 text-destructive" strokeWidth={1.5} />
                              {COPY.ADMIN.WAIVE}
                            </Button>
                          </div>
                        )}
                        {entry.ledger_status === "SETTLED" && entry.settled_at && (
                          <span className="text-xs text-muted-foreground font-semibold">
                            {COPY.ADMIN.SETTLED_ON}{" "}
                            {new Date(entry.settled_at).toLocaleDateString()}
                          </span>
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
              className="tactile-btn text-xs font-semibold bg-brand text-brand-foreground hover:bg-brand/90"
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
