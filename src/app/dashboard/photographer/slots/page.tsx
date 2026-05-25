import { createSupabaseServer } from "@/lib/supabase-server";
import { PhotographerSlotsClient } from "./SlotsClient";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import COPY from "@/lib/constants/copy";

export default async function PhotographerSlotsPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{COPY.PHOTOGRAPHER_DASHBOARD.LOGIN_TO_VIEW_SLOTS}</p>
        <Link href="/auth">
          <Button className="ml-3">{COPY.COMMON.LOGIN}</Button>
        </Link>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/photographer/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{COPY.PHOTOGRAPHER_DASHBOARD.MANAGE_SLOTS}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PhotographerSlotsClient slots={slots || []} />
      </div>
    </div>
  );
}
