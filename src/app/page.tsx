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
import { Camera, GraduationCap, MapPin, Clock, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { role: string; full_name: string; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url")
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
        .select("id, slug, full_name, bio, gowns_json, account_status, avatar_url")
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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-brand/10 group-hover:bg-brand/20 transition-colors duration-300">
              <Camera className="h-5 w-5 text-brand" />
            </div>
            <span className="text-xl font-bold tracking-tight">{COPY.BRAND.NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardHref} className="flex items-center gap-2">
                  <Avatar size="sm">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    ) : null}
                    <AvatarFallback>{(profile?.full_name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {profile?.full_name || user.email}
                  </span>
                </Link>
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {COPY.HOME.WELCOME_BACK(profile?.full_name ?? "")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {COPY.HOME.PHOTOGRAPHER_SUBTITLE}
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-light text-brand-foreground font-medium">
                <Camera className="h-4 w-4" /> {photographerSlots?.length || 0} {COPY.HOME.ACTIVE_SLOTS}
              </span>
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary font-medium">
                <Clock className="h-4 w-4" /> {pendingOrders?.length || 0} {COPY.HOME.PENDING_ORDERS}
              </span>
            </div>
          </section>

          {/* Photographer Quick Actions */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-lift border-l-4 border-l-brand">
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

              <Card className="hover-lift border-l-4 border-l-brand">
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {COPY.HOME.ADMIN_DASHBOARD}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {COPY.HOME.ADMIN_SUBTITLE}
            </p>
          </section>

          {/* Admin Quick Actions */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-lift border-l-4 border-l-brand">
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

              <Card className="hover-lift border-l-4 border-l-brand">
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

              <Card className="hover-lift border-l-4 border-l-brand">
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
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-background to-background" />
            <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                  {COPY.HOME.HERO_TITLE}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                  {COPY.HOME.HERO_SUBTITLE}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand/10 text-brand font-medium text-sm">
                    <MapPin className="h-4 w-4" /> {COPY.HOME.LOCATION}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand/10 text-brand font-medium text-sm">
                    <Clock className="h-4 w-4" /> {COPY.HOME.INSTANT_BOOKING}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand/10 text-brand font-medium text-sm">
                    <GraduationCap className="h-4 w-4" /> {COPY.HOME.WECHAT_PAYMENT}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Photographers Grid */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{COPY.HOME.AVAILABLE_PHOTOGRAPHERS}</h2>
            {!photographers || photographers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg">{COPY.HOME.NO_PHOTOGRAPHERS}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photographers.map((p) => (
                  <Link key={p.id} href={`/photographers/${p.slug || p.id}`}>
                    <Card className="hover-lift cursor-pointer h-full group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar size="lg">
                              {p.avatar_url ? (
                                <AvatarImage src={p.avatar_url} alt={p.full_name} />
                              ) : null}
                              <AvatarFallback>{p.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg group-hover:text-brand transition-colors duration-300">{p.full_name}</CardTitle>
                              <Badge variant="secondary" className="mt-1 bg-brand/10 text-brand border-brand/20">{COPY.HOME.PHOTOGRAPHER_BADGE}</Badge>
                            </div>
                          </div>
                        </div>
                        {p.bio && (
                          <CardDescription className="line-clamp-2 mt-2">
                            {p.bio}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(p.gowns_json) &&
                            (p.gowns_json as { degree?: string; size?: string }[]).map(
                              (g, i) => (
                                <Badge key={i} variant="outline" className="border-brand/20 text-brand-foreground/80">
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
