import { createSupabaseAdmin } from "@/lib/supabase-server";
import { getAvailableSlots } from "@/app/actions/slots";
import { PhotographerBookingClient } from "./PhotographerBookingClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PhotographerPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: photographer } = (await createSupabaseAdmin()
    .from("profiles")
    .select("id, full_name, slug, bio, gowns_json, wechat_qr_url, account_status, approval_status, avatar_url, portfolio_json, settings_json")
    .eq("slug", slug)
    .eq("role", "PHOTOGRAPHER")
    .single()) as any;

  if (!photographer || photographer.account_status === "SUSPENDED") {
    notFound();
  }

  const slots = await getAvailableSlots("durham", "");
  const photographerSlots = (slots || []).filter(
    (s) => s.photographer_id === photographer.id
  );

  return (
    <PhotographerBookingClient
      photographer={photographer}
      slots={photographerSlots}
    />
  );
}
