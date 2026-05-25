import { createSupabaseServer } from "@/lib/supabase-server";
import { PhotographersClient } from "./PhotographersClient";

export default async function AdminPhotographersPage() {
  const supabase = await createSupabaseServer();

  const { data: photographers } = await supabase
    .from("profiles")
    .select("id, full_name, wechat_id, uk_phone, bio, approval_status, account_status, commission_owed_pence, gowns_json")
    .eq("role", "PHOTOGRAPHER")
    .order("updated_at", { ascending: false });

  const mapped = (photographers || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    wechat_id: p.wechat_id,
    uk_phone: p.uk_phone,
    bio: p.bio,
    approval_status: p.approval_status,
    account_status: p.account_status,
    commission_owed_pence: p.commission_owed_pence ?? 0,
    gowns_json: p.gowns_json,
    created_at: null as string | null,
  }));

  return <PhotographersClient photographers={mapped} />;
}
