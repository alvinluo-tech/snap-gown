"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import COPY from "@/lib/constants/copy";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} title={COPY.COMPONENTS.LOGOUT_TITLE}>
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
