import { supabase } from "@/lib/supabase";
import { getAvailableSlots } from "@/app/actions/slots";
import { PhotographerBookingClient } from "./PhotographerBookingClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotographerPage({ params }: PageProps) {
  const { id } = await params;

  const { data: photographer } = await supabase
    .from("profiles")
    .select("id, full_name, bio, gowns_json, wechat_qr_url, account_status, approval_status")
    .eq("id", id)
    .eq("role", "PHOTOGRAPHER")
    .single();

  if (!photographer || photographer.account_status === "SUSPENDED") {
    notFound();
  }

  // Fetch available slots for this photographer
  const slots = await getAvailableSlots("durham", "");
  const photographerSlots = (slots || []).filter(
    (s) => s.photographer_id === id
  );

  return (
    <PhotographerBookingClient
      photographer={photographer}
      slots={photographerSlots}
    />
  );
}
