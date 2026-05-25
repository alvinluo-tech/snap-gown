import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft, LayoutDashboard, ShoppingCart, Users, DollarSign, GraduationCap } from "lucide-react";

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
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    redirect("/");
  }

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
            <span className="text-xl font-bold">Admin Dashboard</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard/admin">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Overview
              </Button>
            </Link>
            <Link href="/dashboard/admin/orders">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Orders
              </Button>
            </Link>
            <Link href="/dashboard/admin/photographers">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Photographers
              </Button>
            </Link>
            <Link href="/dashboard/admin/commission">
              <Button variant="ghost" size="sm">
                <DollarSign className="h-4 w-4 mr-1" />
                Commission
              </Button>
            </Link>
            <Link href="/dashboard/admin/students">
              <Button variant="ghost" size="sm">
                <GraduationCap className="h-4 w-4 mr-1" />
                Students
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
