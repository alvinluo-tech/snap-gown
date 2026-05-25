import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import COPY from "@/lib/constants/copy";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, GraduationCap, MapPin, Clock, Shield, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { role: string; full_name: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const isAdmin = profile?.role === "ADMIN";
  const isPhotographer = profile?.role === "PHOTOGRAPHER";

  // Fetch approved photographers (only for students/guests)
  const { data: photographers } = isPhotographer
    ? { data: null }
    : await supabase
        .from("profiles")
        .select("id, slug, full_name, bio, gowns_json, account_status")
        .eq("role", "PHOTOGRAPHER")
        .eq("approval_status", "APPROVED")
        .eq("account_status", "ACTIVE")
        .limit(20);

  // Fetch photographer's upcoming slots count
  const { data: photographerSlots } = isPhotographer
    ? await supabase
        .from("availability_slots")
        .select("id", { count: "exact" })
        .eq("photographer_id", user?.id || "")
        .eq("status", "AVAILABLE")
        .gte("slot_date", new Date().toISOString().split("T")[0])
    : { data: null };

  // Fetch photographer's pending orders count
  const { data: pendingOrders } = isPhotographer
    ? await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("photographer_id", user?.id || "")
        .in("status", ["PENDING_PAYMENT", "PROOF_SUBMITTED"])
    : { data: null };

  const dashboardHref = isPhotographer
    ? "/dashboard/photographer/orders"
    : isAdmin
      ? "/dashboard/admin"
      : "/dashboard/student";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{COPY.BRAND.NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {profile?.full_name || user.email}
                </span>
                <Link href={dashboardHref}>
                  <Button>{COPY.COMMON.DASHBOARD}</Button>
                </Link>
                {isAdmin && (
                  <Link href="/dashboard/admin">
                    <Button variant="secondary">
                      <Shield className="h-4 w-4 mr-1" />
                      {COPY.COMMON.ADMIN}
                    </Button>
                  </Link>
                )}
                <LogoutButton />
                <ThemeToggle />
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline">{COPY.COMMON.LOGIN}</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button>{COPY.COMMON.GET_STARTED}</Button>
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero - Different content for each role */}
      {isPhotographer ? (
        <>
          <section className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {COPY.HOME.WELCOME_BACK(profile?.full_name ?? "")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {COPY.HOME.PHOTOGRAPHER_SUBTITLE}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Camera className="h-4 w-4" /> {photographerSlots?.length || 0} {COPY.HOME.ACTIVE_SLOTS}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {pendingOrders?.length || 0} {COPY.HOME.PENDING_ORDERS}
              </span>
            </div>
          </section>

          {/* Photographer Quick Actions */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{COPY.HOME.MANAGE_ORDERS}</CardTitle>
                  <CardDescription>
                    {COPY.HOME.MANAGE_ORDERS_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/photographer/orders">
                    <Button className="w-full">{COPY.HOME.VIEW_ORDERS}</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{COPY.HOME.MANAGE_AVAILABILITY}</CardTitle>
                  <CardDescription>
                    {COPY.HOME.MANAGE_AVAILABILITY_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/photographer/slots">
                    <Button className="w-full" variant="secondary">{COPY.HOME.MANAGE_AVAILABILITY}</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      ) : isAdmin ? (
        <>
          {/* Admin Hero */}
          <section className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {COPY.HOME.ADMIN_DASHBOARD}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {COPY.HOME.ADMIN_SUBTITLE}
            </p>
          </section>

          {/* Admin Quick Actions */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{COPY.HOME.PHOTOGRAPHERS}</CardTitle>
                  <CardDescription>
                    {COPY.HOME.PHOTOGRAPHERS_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/admin/photographers">
                    <Button className="w-full">{COPY.HOME.MANAGE_PHOTOGRAPHERS}</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{COPY.HOME.ORDERS}</CardTitle>
                  <CardDescription>
                    {COPY.HOME.ORDERS_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/admin/orders">
                    <Button className="w-full" variant="secondary">{COPY.HOME.VIEW_ORDERS}</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{COPY.HOME.ADMIN_PANEL}</CardTitle>
                  <CardDescription>
                    {COPY.HOME.ADMIN_PANEL_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/admin">
                    <Button className="w-full" variant="outline">{COPY.HOME.OPEN_ADMIN_PANEL}</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Student/Guest Hero */}
          <section className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {COPY.HOME.HERO_TITLE}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {COPY.HOME.HERO_SUBTITLE}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {COPY.HOME.LOCATION}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {COPY.HOME.INSTANT_BOOKING}
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" /> {COPY.HOME.WECHAT_PAYMENT}
              </span>
            </div>
          </section>

          {/* Photographers Grid */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold mb-6">{COPY.HOME.AVAILABLE_PHOTOGRAPHERS}</h2>
            {!photographers || photographers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{COPY.HOME.NO_PHOTOGRAPHERS}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photographers.map((p) => (
                  <Link key={p.id} href={`/photographers/${p.slug || p.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{p.full_name}</CardTitle>
                          <Badge variant="secondary">{COPY.HOME.PHOTOGRAPHER_BADGE}</Badge>
                        </div>
                        {p.bio && (
                          <CardDescription className="line-clamp-2">
                            {p.bio}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(p.gowns_json) &&
                            (p.gowns_json as { degree?: string; size?: string }[]).map(
                              (g, i) => (
                                <Badge key={i} variant="outline">
                                  {g.degree} - {g.size}
                                </Badge>
                              )
                            )}
                        </div>
                        <Button className="w-full mt-4" variant="secondary">
                          {COPY.HOME.VIEW_SLOTS_BOOK}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
