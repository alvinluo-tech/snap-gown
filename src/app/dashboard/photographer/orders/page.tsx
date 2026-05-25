import { createSupabaseServer } from "@/lib/supabase-server";
import { penceToPounds, penceToRMB } from "@/lib/utils";
import { PhotographerOrdersClient } from "./OrdersClient";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PhotographerOrdersPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your orders.</p>
        <Link href="/auth">
          <Button className="ml-3">Login</Button>
        </Link>
      </div>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "*, availability_slots(slot_date, start_time, end_time, school_slug), profiles!user_id(full_name, wechat_id, uk_phone)"
    )
    .eq("photographer_id", user.id)
    .order("created_at", { ascending: false });

  // Get photographer debt
  const { data: profile } = await supabase
    .from("profiles")
    .select("commission_owed_pence, account_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Photographer Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/photographer/slots">
              <Button variant="outline">Manage Slots</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Debt Warning */}
        {profile && (profile.commission_owed_pence ?? 0) > 0 && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              profile.account_status === "SUSPENDED"
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-warning/10 border-warning/20 text-warning"
            }`}
          >
            <p className="font-medium">
              {profile.account_status === "SUSPENDED"
                ? "Account Suspended"
                : "Outstanding Commission"}
              : £{penceToPounds(profile.commission_owed_pence ?? 0)}
            </p>
            <p className="text-sm mt-1">
              {profile.account_status === "SUSPENDED"
                ? "Your account is suspended. Please contact admin to settle commission."
                : "Please settle your commission with the platform."}
            </p>
          </div>
        )}

        <PhotographerOrdersClient
          orders={(orders || []).map((o) => ({
            ...o,
            availability_slots: o.availability_slots as unknown as {
              slot_date: string;
              start_time: string;
              end_time: string;
            },
            profiles: o.profiles as unknown as {
              full_name: string;
              wechat_id: string;
              uk_phone: string | null;
            },
          }))}
        />
      </div>
    </div>
  );
}
