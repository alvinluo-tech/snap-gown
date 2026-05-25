"use server";

import { createSupabaseServer } from "@/lib/supabase-server";

// Auto-release expired holds and cancel expired orders
async function cleanupExpiredHolds(supabase: Awaited<ReturnType<typeof createSupabaseServer>>) {
  await supabase.rpc("release_expired_holds");
}

export async function getAvailableSlots(schoolSlug: string, date: string) {
  const supabase = await createSupabaseServer();
  await cleanupExpiredHolds(supabase);

  let query = supabase
    .from("availability_slots")
    .select("*, profiles!photographer_id(full_name, bio, gowns_json, wechat_qr_url, account_status)")
    .eq("school_slug", schoolSlug)
    .eq("status", "AVAILABLE")
    .order("start_time");

  if (date) {
    query = query.eq("slot_date", date);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}

export async function getPhotographerSlots(photographerId: string) {
  const supabase = await createSupabaseServer();
  await cleanupExpiredHolds(supabase);

  // Check if photographer is suspended - return empty if so
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", photographerId)
    .single();

  if (profile?.account_status === "SUSPENDED") return [];

  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("photographer_id", photographerId)
    .gte("slot_date", new Date().toISOString().split("T")[0])
    .order("slot_date")
    .order("start_time");

  if (error) throw new Error(error.message);
  return data;
}

export async function createSlot(formData: FormData) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const slotDate = formData.get("slot_date") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;
  const schoolSlug = (formData.get("school_slug") as string) || "durham";
  const pricePence = parseInt(formData.get("price_pence") as string) || 15000;

  // Validate photographer is approved
  const { data: profile } = await supabase
    .from("profiles")
    .select("approval_status, account_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.approval_status !== "APPROVED") {
    throw new Error("Photographer not approved");
  }
  if (profile.account_status === "SUSPENDED") {
    throw new Error("Account suspended");
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      photographer_id: user.id,
      school_slug: schoolSlug,
      slot_date: slotDate,
      start_time: startTime,
      end_time: endTime,
      price_pence: pricePence,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This time slot already exists");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function deleteSlot(slotId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("photographer_id", user.id)
    .eq("status", "AVAILABLE");

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function batchCreateSlots(formData: FormData) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) throw new Error("Unauthorized");

  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;
  const schoolSlug = (formData.get("school_slug") as string) || "durham";
  const pricePence = parseInt(formData.get("price_pence") as string) || 15000;

  const slots: { photographer_id: string; school_slug: string; slot_date: string; start_time: string; end_time: string; price_pence: number }[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    slots.push({
      photographer_id: user.id,
      school_slug: schoolSlug,
      slot_date: current.toISOString().split("T")[0],
      start_time: startTime,
      end_time: endTime,
      price_pence: pricePence,
    });
    current.setDate(current.getDate() + 1);
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .insert(slots)
    .select();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Some time slots already exist (duplicate dates/times)");
    }
    throw new Error(error.message);
  }
  return data;
}
