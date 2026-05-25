import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, ArrowLeft, ShoppingCart, Calendar, User } from "lucide-react";
import COPY from "@/lib/constants/copy";

export default async function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, avatar_url, commission_owed_pence")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "PHOTOGRAPHER") {
    redirect("/");
  }

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "PG";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">
              {COPY.PHOTOGRAPHER_DASHBOARD.TITLE}
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard/photographer/orders">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-4 w-4 mr-1" />
                {COPY.PHOTOGRAPHER_DASHBOARD.ORDER_MANAGEMENT}
              </Button>
            </Link>
            <Link href="/dashboard/photographer/slots">
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                {COPY.PHOTOGRAPHER_DASHBOARD.MANAGE_SLOTS}
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-1" />
                {COPY.PROFILE.TITLE}
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Avatar size="sm">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Avatar" />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
