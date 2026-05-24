import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, GraduationCap, MapPin, Clock } from "lucide-react";

export default async function HomePage() {
  // Fetch approved photographers with available slots
  const { data: photographers } = await supabase
    .from("profiles")
    .select("id, full_name, bio, gowns_json, account_status")
    .eq("role", "PHOTOGRAPHER")
    .eq("approval_status", "APPROVED")
    .eq("account_status", "ACTIVE")
    .limit(20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SnapGown</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/dashboard/student">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
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
              <Link key={p.id} href={`/photographers/${p.id}`}>
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
    </div>
  );
}
