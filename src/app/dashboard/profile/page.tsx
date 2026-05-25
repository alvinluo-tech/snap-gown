import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ProfileSettingsClient, type Profile } from "./ProfileSettingsClient";

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth");

  return <ProfileSettingsClient profile={profile} />;
}
