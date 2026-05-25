import { getAdminStatsEnhanced } from "@/app/actions/verification";
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
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
  Camera,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  let stats;
  try {
    stats = await getAdminStatsEnhanced();
  } catch {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load admin stats. Are you logged in as admin?</p>
      </div>
    );
  }

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: "Pending Payment", value: stats.orderStats.PENDING_PAYMENT || 0, icon: Clock, color: "text-warning" },
          { title: "Awaiting Verification", value: stats.orderStats.PROOF_SUBMITTED || 0, icon: ShoppingCart, color: "text-primary" },
          { title: "Confirmed", value: stats.orderStats.CONFIRMED || 0, icon: CheckCircle, color: "text-primary" },
          { title: "Overdue", value: stats.orderStats.VERIFICATION_OVERDUE || 0, icon: AlertTriangle, color: "text-destructive" },
          { title: "Completed", value: stats.orderStats.COMPLETED || 0, icon: CheckCircle, color: "text-primary" },
          { title: "Cancelled", value: stats.orderStats.CANCELLED || 0, icon: ShoppingCart, color: "text-muted-foreground" },
        ].map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commission Owed
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              £{penceToPounds(stats.totalCommissionPence)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <Link href="/dashboard/admin/photographers">
              <Button variant="link" size="sm" className="px-0 mt-1">
                Review now <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Photographers
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhotographers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Pending Photographers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/dashboard/admin/orders">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats.recentOrders as unknown as Array<{ id: string; order_no: string; status: string; total_amount_pence: number; student: { full_name: string } | null }>).map(
                    (order) => {
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.order_no}
                          </TableCell>
                          <TableCell>{order.student?.full_name || "-"}</TableCell>
                          <TableCell>
                            £{penceToPounds(order.total_amount_pence)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(order.status)}>
                              {order.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pending Photographers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Photographers</CardTitle>
            <Link href="/dashboard/admin/photographers">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.pendingPhotographers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No pending approvals.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>WeChat</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats.pendingPhotographers as unknown as Array<{ id: string; full_name: string; wechat_id: string }>).map(
                    (p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.full_name}
                        </TableCell>
                        <TableCell>{p.wechat_id}</TableCell>
                        <TableCell>
                          <Link href="/dashboard/admin/photographers">
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
