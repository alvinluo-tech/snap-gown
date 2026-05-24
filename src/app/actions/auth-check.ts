"use server";

import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) return false;
    return data.users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
  } catch {
    return false;
  }
}
