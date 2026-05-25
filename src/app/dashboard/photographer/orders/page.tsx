import { createSupabaseServer } from "@/lib/supabase-server";
import { penceToPounds } from "@/lib/utils";
import { PhotographerOrdersClient } from "./OrdersClient";
import COPY from "@/lib/constants/copy";

export default async function PhotographerOrdersPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>{COPY.PHOTOGRAPHER_DASHBOARD.LOGIN_TO_VIEW}</p>
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
    <>
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
              ? COPY.PHOTOGRAPHER_DASHBOARD.ACCOUNT_SUSPENDED
              : COPY.PHOTOGRAPHER_DASHBOARD.OUTSTANDING_COMMISSION}
            : £{penceToPounds(profile.commission_owed_pence ?? 0)}
          </p>
          <p className="text-sm mt-1">
            {profile.account_status === "SUSPENDED"
              ? COPY.PHOTOGRAPHER_DASHBOARD.SUSPENDED_MESSAGE
              : COPY.PHOTOGRAPHER_DASHBOARD.COMMISSION_MESSAGE}
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
    </>
  );
}
