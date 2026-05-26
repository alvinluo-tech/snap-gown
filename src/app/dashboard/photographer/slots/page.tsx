import { createSupabaseServer } from "@/lib/supabase-server";
import { PhotographerSlotsClient } from "./SlotsClient";
import COPY from "@/lib/constants/copy";

interface PhotographerSettings {
  default_price_pounds?: number;
  camera_model?: string;
  delivery_promise?: string;
}

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

  // Fetch photographer's slots and profile settings in parallel
  const [{ data: slots }, { data: profile }] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("*")
      .eq("photographer_id", user.id)
      .gte("slot_date", new Date().toISOString().split("T")[0])
      .order("slot_date")
      .order("start_time"),
    supabase
      .from("profiles")
      .select("settings_json")
      .eq("id", user.id)
      .single(),
  ]);

  const settings = ((profile as unknown as { settings_json?: PhotographerSettings } | null)?.settings_json) || {};
  const defaultPricePounds = settings.default_price_pounds;

  return (
    <PhotographerSlotsClient
      slots={slots || []}
      defaultPricePounds={defaultPricePounds}
    />
  );
}

