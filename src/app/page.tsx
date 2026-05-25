import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
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
            <span className="text-xl font-bold">SnapGown</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {profile?.full_name || user.email}
                </span>
                <Link href={dashboardHref}>
                  <Button>Dashboard</Button>
                </Link>
                {isAdmin && (
                  <Link href="/dashboard/admin">
                    <Button variant="secondary">
                      <Shield className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}
                <LogoutButton />
                <ThemeToggle />
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button>Get Started</Button>
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
              Welcome back, {profile?.full_name}!
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage your bookings and availability slots. Start accepting graduation photoshoot requests.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Camera className="h-4 w-4" /> {photographerSlots?.length || 0} Active Slots
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {pendingOrders?.length || 0} Pending Orders
              </span>
            </div>
          </section>

          {/* Photographer Quick Actions */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Manage Orders</CardTitle>
                  <CardDescription>
                    View and manage incoming booking requests from students.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/photographer/orders">
                    <Button className="w-full">View Orders</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Manage Availability</CardTitle>
                  <CardDescription>
                    Set your available time slots for students to book.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/photographer/slots">
                    <Button className="w-full" variant="secondary">Manage Slots</Button>
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
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage photographers, orders, and platform settings.
            </p>
          </section>

          {/* Admin Quick Actions */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Photographers</CardTitle>
                  <CardDescription>
                    Review and approve photographer applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/admin/photographers">
                    <Button className="w-full">Manage Photographers</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>
                    View and manage all orders on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/admin/orders">
                    <Button className="w-full" variant="secondary">View Orders</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Admin Panel</CardTitle>
                  <CardDescription>
                    Access the full admin dashboard with analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/admin">
                    <Button className="w-full" variant="outline">Open Admin Panel</Button>
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
              Book Your Graduation Photoshoot
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find professional photographers at Durham University.
              Choose a time slot, pay via WeChat, and get stunning graduation photos.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Durham University
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Instant Booking
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" /> WeChat Payment
              </span>
            </div>
          </section>

          {/* Photographers Grid */}
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold mb-6">Available Photographers</h2>
            {!photographers || photographers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No photographers available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photographers.map((p) => (
                  <Link key={p.id} href={`/photographers/${p.slug || p.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{p.full_name}</CardTitle>
                          <Badge variant="secondary">Photographer</Badge>
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
                          View Slots & Book
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
