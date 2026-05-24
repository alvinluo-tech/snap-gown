import { getAdminStats } from "@/app/actions/verification";
import { penceToPounds } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
} from "lucide-react";

export default async function AdminOverviewPage() {
  let stats;
  try {
    stats = await getAdminStats();
  } catch {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load admin stats. Are you logged in as admin?</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Pending Payment",
      value: stats.orderStats.PENDING_PAYMENT || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Awaiting Verification",
      value: stats.orderStats.PROOF_SUBMITTED || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Confirmed",
      value: stats.orderStats.CONFIRMED || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Overdue (Need Action)",
      value: stats.orderStats.VERIFICATION_OVERDUE || 0,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Completed",
      value: stats.orderStats.COMPLETED || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Cancelled",
      value: stats.orderStats.CANCELLED || 0,
      icon: ShoppingCart,
      color: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
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

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Total Commission Owed</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              £{penceToPounds(stats.totalCommissionPence)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Outstanding across all photographers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Photographers awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
