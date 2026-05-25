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
import { CheckCircle, XCircle, Search, DollarSign } from "lucide-react";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{COPY.ADMIN.COMMISSION_LEDGER}</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {COPY.ADMIN.PENDING}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              £{penceToPounds(totalPending)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {COPY.ADMIN.SETTLED}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              £{penceToPounds(totalSettled)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {COPY.ADMIN.TOTAL_ENTRIES}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledger.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={COPY.ADMIN.SEARCH_COMMISSION}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={COPY.ADMIN.FILTER_BY_STATUS} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "ALL" ? COPY.ADMIN.ALL_STATUSES : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{COPY.ADMIN.COMMISSION_ENTRIES(filtered.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {search || statusFilter !== "ALL"
                ? COPY.ADMIN.NO_ENTRIES_MATCH
                : COPY.ADMIN.NO_ENTRIES_YET}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{COPY.COMMON.ORDER}</TableHead>
                    <TableHead>{COPY.COMMON.PHOTOGRAPHER}</TableHead>
                    <TableHead>{COPY.ADMIN.ORDER_AMOUNT}</TableHead>
                    <TableHead>{COPY.ADMIN.COMMISSION_AMOUNT}</TableHead>
                    <TableHead>{COPY.COMMON.STATUS}</TableHead>
                    <TableHead>{COPY.COMMON.DATE}</TableHead>
                    <TableHead>{COPY.COMMON.ACTIONS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">
                        {entry.order?.order_no || "-"}
                      </TableCell>
                      <TableCell>
                        {entry.photographer?.full_name || "-"}
                      </TableCell>
                      <TableCell>
                        £{penceToPounds(entry.order?.total_amount_pence || 0)}
                      </TableCell>
                      <TableCell className="font-medium">
                        £{penceToPounds(entry.platform_fee_pence)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(entry.ledger_status)}>
                          {entry.ledger_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {entry.ledger_status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSettle(entry.id)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {COPY.ADMIN.SETTLE}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWaive(entry.id)}
                              disabled={loading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {COPY.ADMIN.WAIVE}
                            </Button>
                          </div>
                        )}
                        {entry.ledger_status === "SETTLED" && entry.settled_at && (
                          <span className="text-xs text-muted-foreground">
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
            <Button onClick={confirmDialog.action} disabled={loading}>
              {COPY.COMMON.CONFIRM}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
