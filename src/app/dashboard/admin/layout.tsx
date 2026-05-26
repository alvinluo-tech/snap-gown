import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft, LayoutDashboard, ShoppingCart, Users, DollarSign, GraduationCap, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import COPY from "@/lib/constants/copy";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({
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
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain">
      {/* Ambient background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Overhaul */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="tactile-btn rounded-xl hover:bg-muted text-foreground">
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </Link>
            <Camera className="h-5 w-5 text-brand" strokeWidth={1.5} />
            <span className="text-xl font-serif italic font-semibold text-primary">
              {COPY.HOME.ADMIN_DASHBOARD}
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-2 lg:gap-3">
            <Link href="/dashboard/admin">
              <Button variant="ghost" size="sm" className="tactile-btn text-xs font-semibold hover:bg-muted">
                <LayoutDashboard className="h-4 w-4 mr-1.5 text-brand" strokeWidth={1.5} />
                {COPY.ADMIN.OVERVIEW}
              </Button>
            </Link>
            <Link href="/dashboard/admin/orders">
              <Button variant="ghost" size="sm" className="tactile-btn text-xs font-semibold hover:bg-muted">
                <ShoppingCart className="h-4 w-4 mr-1.5 text-brand" strokeWidth={1.5} />
                {COPY.ADMIN.ORDERS}
              </Button>
            </Link>
            <Link href="/dashboard/admin/photographers">
              <Button variant="ghost" size="sm" className="tactile-btn text-xs font-semibold hover:bg-muted">
                <Users className="h-4 w-4 mr-1.5 text-brand" strokeWidth={1.5} />
                {COPY.ADMIN.PHOTOGRAPHERS}
              </Button>
            </Link>
            <Link href="/dashboard/admin/commission">
              <Button variant="ghost" size="sm" className="tactile-btn text-xs font-semibold hover:bg-muted">
                <DollarSign className="h-4 w-4 mr-1.5 text-brand" strokeWidth={1.5} />
                {COPY.ADMIN.COMMISSION}
              </Button>
            </Link>
            <Link href="/dashboard/admin/students">
              <Button variant="ghost" size="sm" className="tactile-btn text-xs font-semibold hover:bg-muted">
                <GraduationCap className="h-4 w-4 mr-1.5 text-brand" strokeWidth={1.5} />
                {COPY.ADMIN.STUDENTS}
              </Button>
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-2 pl-2 border-l border-border/60">
              <Avatar size="sm" className="border border-brand/20 shadow-xs h-8 w-8">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile?.full_name || "Admin"} />
                ) : null}
                <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold">
                  <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                </AvatarFallback>
              </Avatar>
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">{children}</div>
    </div>
  );
}
