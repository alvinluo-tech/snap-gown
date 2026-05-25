import { createSupabaseServer } from "@/lib/supabase-server";
import { PhotographerSlotsClient } from "./SlotsClient";
import COPY from "@/lib/constants/copy";

export default async function PhotographerSlotsPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>{COPY.PHOTOGRAPHER_DASHBOARD.LOGIN_TO_VIEW_SLOTS}</p>
      </div>
    );
  }

  // Fetch photographer's slots
  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("photographer_id", user.id)
    .gte("slot_date", new Date().toISOString().split("T")[0])
    .order("slot_date")
    .order("start_time");

  return <PhotographerSlotsClient slots={slots || []} />;
}
