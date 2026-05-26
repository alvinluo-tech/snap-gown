import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
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
import { Camera, GraduationCap, MapPin, Clock, Shield, ArrowRight, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PhotographerListClient } from "@/components/PhotographerListClient";

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
    : (await createSupabaseAdmin()
        .from("profiles")
        .select("id, slug, full_name, bio, gowns_json, account_status, avatar_url, portfolio_json, settings_json")
        .eq("role", "PHOTOGRAPHER")
        .eq("approval_status", "APPROVED")
        .eq("account_status", "ACTIVE")
        .limit(20) as any);

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
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain">
      {/* Decorative top background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-brand/10 group-hover:bg-brand/20 transition-all duration-300 transform group-hover:rotate-6">
              <Camera className="h-5 w-5 text-brand" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-serif italic font-semibold tracking-tight text-primary">
              {COPY.BRAND.NAME}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href={dashboardHref} className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-muted/80 transition-all duration-300">
                  <Avatar size="sm" className="border border-brand/20">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    ) : null}
                    <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold">
                      {(profile?.full_name || user.email || "").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden md:inline">
                    {profile?.full_name || user.email}
                  </span>
                </Link>
                <Link href={dashboardHref}>
                  <Button size="sm" className="tactile-btn font-medium bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm">
                    {COPY.COMMON.DASHBOARD}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/dashboard/admin">
                    <Button size="sm" variant="outline" className="tactile-btn border-brand/20 text-brand hover:bg-brand/5">
                      <Shield className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
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
                  <Button variant="ghost" size="sm" className="tactile-btn text-foreground font-medium hover:bg-muted">
                    {COPY.COMMON.LOGIN}
                  </Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button size="sm" className="tactile-btn font-medium bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm shadow-brand/10">
                    {COPY.COMMON.GET_STARTED}
                  </Button>
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero - Dynamic content per role */}
      {isPhotographer ? (
        <>
          <section className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
            <Badge variant="outline" className="mb-4 border-brand/20 text-brand bg-brand/5 uppercase tracking-widest text-[10px] px-3.5 py-1">
              Photographer Account Portal
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-primary font-bold tracking-tight mb-6 leading-tight">
              {COPY.HOME.WELCOME_BACK(profile?.full_name ?? "")}
            </h1>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-sans">
              {COPY.HOME.PHOTOGRAPHER_SUBTITLE}
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <span className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-brand/20 bg-brand-light text-brand-foreground dark:text-brand font-medium text-sm">
                <Camera className="h-4 w-4 text-brand" strokeWidth={1.75} /> 
                <span className="font-mono">{photographerSlots?.length || 0}</span> {COPY.HOME.ACTIVE_SLOTS}
              </span>
              <span className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-muted bg-card text-foreground font-medium text-sm shadow-sm">
                <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} /> 
                <span className="font-mono text-primary font-semibold">{pendingOrders?.length || 0}</span> {COPY.HOME.PENDING_ORDERS}
              </span>
            </div>
          </section>

          {/* Photographer Quick Actions */}
          <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="hover-lift bg-card border border-border/80 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-2 h-full bg-brand" />
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-xl font-serif italic font-semibold text-primary">{COPY.HOME.MANAGE_ORDERS}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {COPY.HOME.MANAGE_ORDERS_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-8 pt-4">
                  <Link href="/dashboard/photographer/orders">
                    <Button className="w-full tactile-btn bg-primary text-primary-foreground hover:bg-primary/95 group-hover:translate-x-0.5 transition-transform duration-300">
                      {COPY.HOME.VIEW_ORDERS}
                      <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-lift bg-card border border-border/80 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-xl font-serif italic font-semibold text-primary">{COPY.HOME.MANAGE_AVAILABILITY}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {COPY.HOME.MANAGE_AVAILABILITY_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-8 pt-4">
                  <Link href="/dashboard/photographer/slots">
                    <Button className="w-full tactile-btn" variant="secondary">
                      {COPY.HOME.MANAGE_AVAILABILITY}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      ) : isAdmin ? (
        <>
          {/* Admin Hero */}
          <section className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
            <Badge variant="outline" className="mb-4 border-brand/20 text-brand bg-brand/5 uppercase tracking-widest text-[10px] px-3.5 py-1">
              System Admin Console
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-primary font-bold tracking-tight mb-6 leading-tight">
              {COPY.HOME.ADMIN_DASHBOARD}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {COPY.HOME.ADMIN_SUBTITLE}
            </p>
          </section>

          {/* Admin Quick Actions */}
          <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover-lift bg-card border border-border/80 rounded-2xl overflow-hidden group">
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-lg font-serif italic font-semibold text-primary">{COPY.HOME.PHOTOGRAPHERS}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {COPY.HOME.PHOTOGRAPHERS_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-8 pt-4">
                  <Link href="/dashboard/admin/photographers">
                    <Button className="w-full tactile-btn bg-brand text-brand-foreground hover:bg-brand/90">
                      {COPY.HOME.MANAGE_PHOTOGRAPHERS}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-lift bg-card border border-border/80 rounded-2xl overflow-hidden group">
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-lg font-serif italic font-semibold text-primary">{COPY.HOME.ORDERS}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {COPY.HOME.ORDERS_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-8 pt-4">
                  <Link href="/dashboard/admin/orders">
                    <Button className="w-full tactile-btn" variant="secondary">
                      {COPY.HOME.VIEW_ORDERS}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-lift bg-card border border-border/80 rounded-2xl overflow-hidden group">
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-lg font-serif italic font-semibold text-primary">{COPY.HOME.ADMIN_PANEL}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {COPY.HOME.ADMIN_PANEL_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-8 pt-4">
                  <Link href="/dashboard/admin">
                    <Button className="w-full tactile-btn" variant="outline">
                      {COPY.HOME.OPEN_ADMIN_PANEL}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Student/Guest Hero - Asymmetric Editorial Layout */}
          <section className="relative z-10 py-16 md:py-28 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column - Content (7 cols) */}
              <div className="lg:col-span-7 space-y-8 text-left">
                {/* 1. Hero Eyebrow Tag */}
                <Badge variant="outline" className="border-brand/35 text-brand bg-brand/5 uppercase tracking-widest text-[10px] px-3.5 py-1">
                  Durham Pilot 2026
                </Badge>
                
                {/* 2. Hero Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-primary font-bold tracking-tight leading-[1.15]">
                  {COPY.HOME.HERO_TITLE}
                </h1>
                
                {/* 3. Hero Subheadline (Strict copy discipline: concise & elegant) */}
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[55ch]">
                  在杜伦大学寻找您的专属摄影师。一键预留黄金拍摄档期，扫码即付，定格永恒的英伦礼赞。
                </p>
                
                {/* 4. Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/auth?tab=register">
                    <Button size="lg" className="tactile-btn font-medium bg-brand text-brand-foreground hover:bg-brand/90 px-8 h-12 shadow-md shadow-brand/10">
                      {COPY.COMMON.GET_STARTED}
                      <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                    </Button>
                  </Link>
                  <a href="#photographers-section">
                    <Button size="lg" variant="outline" className="tactile-btn font-medium bg-card border-border/80 hover:bg-muted text-foreground px-6 h-12">
                      {COPY.HOME.VIEW_SLOTS_BOOK}
                    </Button>
                  </a>
                </div>

                {/* Info Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-6 text-sm text-muted-foreground border-t border-border/50 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/5 text-primary font-medium text-xs">
                    <MapPin className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> {COPY.HOME.LOCATION}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/5 text-primary font-medium text-xs">
                    <Clock className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> {COPY.HOME.INSTANT_BOOKING}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/5 text-primary font-medium text-xs">
                    <GraduationCap className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> {COPY.HOME.WECHAT_PAYMENT}
                  </span>
                </div>
              </div>

              {/* Right Column - Asymmetric Editorial Visual Frame (5 cols) */}
              <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
                <div className="relative group max-w-md w-full aspect-[4/5] rounded-[24px] overflow-hidden border border-border/60 bg-card p-3 shadow-xl transform rotate-2 hover:rotate-0 transition-all duration-500 ease-out">
                  <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-muted">
                    <img 
                      src="/images/durham_graduation_hero.png" 
                      alt="Durham Graduation Editorial Portrait"
                      className="w-full h-full object-cover transform scale-102 group-hover:scale-100 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />
                  </div>
                  {/* Decorative badge overlay */}
                  <div className="absolute bottom-6 left-6 right-6 academic-glass border border-white/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-serif italic text-primary font-bold">Durham Cathedral</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Castle & Collegiate Portraiture</p>
                    </div>
                    <div className="p-2 rounded-lg bg-brand/10">
                      <GraduationCap className="h-4 w-4 text-brand" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Trusted Brand Logo Wall Section (Strictly below the Hero) */}
          <section className="border-y border-border/40 bg-card/40 backdrop-blur-sm py-8 relative z-10">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-medium font-sans">
                Professional Photography Serving
              </span>
              <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 mt-6 opacity-75 grayscale contrast-150">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif italic font-bold text-primary tracking-tight">Durham University</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif italic font-bold text-primary tracking-tight">Collegiate Assembly</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif italic font-bold text-primary tracking-tight">Saint Mary's College</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif italic font-bold text-primary tracking-tight">Grey College</span>
                </div>
              </div>
            </div>
          </section>

          {/* Photographers Bento Grid Section */}
          <section id="photographers-section" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
            
            {!photographers || photographers.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl bg-card/50">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1} />
                <p className="text-base text-muted-foreground">{COPY.HOME.NO_PHOTOGRAPHERS}</p>
              </div>
            ) : (
              <PhotographerListClient initialPhotographers={photographers as any} />
            )}
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-serif italic font-semibold text-primary">{COPY.BRAND.NAME}</span>
            <span className="text-xs text-muted-foreground/70 ml-2">Durham University Pilot</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/rules" className="hover:text-brand transition-colors">免责声明与服务规则</Link>
            <span className="text-muted-foreground/30">|</span>
            <p className="text-xs text-muted-foreground/60">© 2026 {COPY.BRAND.NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
