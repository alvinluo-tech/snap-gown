"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
import { toast } from "sonner";
import { CheckCircle, XCircle, Ban, Check, Clock } from "lucide-react";

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

  const handleApproval = async (
    photographerId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: status })
        .eq("id", photographerId);

      if (error) throw error;
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
    setLoading(true);
    const newStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: newStatus })
        .eq("id", photographerId);

      if (error) throw error;
      toast.success(`Account ${newStatus.toLowerCase()}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  };

  const handleClearDebt = async (photographerId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ commission_owed_pence: 0, account_status: "ACTIVE" })
        .eq("id", photographerId);

      if (error) throw error;
      toast.success("Debt cleared and account reactivated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  };

  const pendingPhotographers = photographers.filter(
    (p) => p.approval_status === "PENDING"
  );
  const otherPhotographers = photographers.filter(
    (p) => p.approval_status !== "PENDING"
  );

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingPhotographers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
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
              No photographers registered yet.
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
    </div>
  );
}
