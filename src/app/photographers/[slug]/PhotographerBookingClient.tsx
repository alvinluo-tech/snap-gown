"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarScheduler } from "@/components/CalendarScheduler";
import { bookSlot } from "@/app/actions/booking";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, ArrowLeft, GraduationCap, Clock } from "lucide-react";
import { penceToPounds } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import COPY from "@/lib/constants/copy";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";

export function parsePortfolio(json: unknown): string[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as string[];
  if (typeof json === "string") {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      // Ignore
    }
  }
  return [];
}

interface Photographer {
  id: string;
  full_name: string;
  bio: string | null;
  gowns_json: unknown;
  wechat_qr_url: string | null;
  account_status: string | null;
  avatar_url: string | null;
  portfolio_json?: unknown;
  settings_json?: unknown;
}

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: string;
  photographer_id: string;
  price_pence?: number;
  profiles?: {
    full_name: string;
    bio: string | null;
    gowns_json: unknown;
    wechat_qr_url: string | null;
    account_status: string | null;
  };
}

export function PhotographerBookingClient({
  photographer,
  slots,
}: {
  photographer: Photographer;
  slots: Slot[];
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(false);

  const handleBookSlot = async (slot: Slot) => {
    setBooking(true);
    try {
      const order = await bookSlot(slot.id, photographer.id);
      toast.success(COPY.PHOTOGRAPHER_PAGE.SLOT_RESERVED);
      router.push(`/checkout/${order.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : COPY.PHOTOGRAPHER_PAGE.BOOKING_FAILED
      );
    }
    setBooking(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain pb-24">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="tactile-btn rounded-xl hover:bg-muted text-foreground">
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </Link>
          <Camera className="h-5 w-5 text-brand" strokeWidth={1.5} />
          <span className="text-xl font-serif italic font-semibold text-primary">{COPY.BRAND.NAME}</span>
          <Badge variant="outline" className="ml-auto border-brand/20 text-brand bg-brand/5 text-[9px] uppercase tracking-widest px-2.5">
            Photographer Profile
          </Badge>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Photographer Info Overhaul */}
        <Card className="hover-lift border border-border/85 bg-card rounded-[24px] overflow-hidden relative p-4 shadow-sm">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand" />
          
          <CardHeader className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <Avatar size="lg" className="h-20 w-20 border-2 border-brand/20 shadow-md">
                  {photographer.avatar_url ? (
                    <AvatarImage src={photographer.avatar_url} alt={photographer.full_name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                    {photographer.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
                    {photographer.full_name}
                  </h1>
                  <Badge className="bg-brand/10 text-brand border border-brand/20 font-medium">
                    {COPY.HOME.PHOTOGRAPHER_BADGE}
                  </Badge>
                </div>
              </div>

              {(() => {
                const pricedSlots = slots.filter((s) => s.price_pence && s.price_pence > 0);
                const minPricePence = pricedSlots.length > 0
                  ? Math.min(...pricedSlots.map((s) => s.price_pence!))
                  : null;
                const settingsPrice = (photographer.settings_json as { default_price_pounds?: number } | null)
                  ?.default_price_pounds;
                const displayPrice = minPricePence !== null
                  ? penceToPounds(minPricePence)
                  : settingsPrice
                    ? `£${settingsPrice.toFixed(2)}`
                    : null;

                return (
                  <div className="self-center sm:self-start bg-muted/40 rounded-xl px-4 py-2.5 border border-border/60 text-center font-sans">
                    <span className="text-xs text-muted-foreground block font-medium">拍摄起价</span>
                    <span className="text-base font-bold text-primary font-mono block mt-0.5">
                      {displayPrice
                        ? (minPricePence !== null
                            ? COPY.PHOTOGRAPHER_PAGE.FROM_PRICE(displayPrice)
                            : `从 ${displayPrice} 起`)
                        : "--"}
                    </span>
                  </div>
                );
              })()}
            </div>

            {photographer.bio && (
              <p className="text-sm text-muted-foreground/90 mt-6 leading-relaxed max-w-[70ch] text-center sm:text-left">
                {photographer.bio}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 pt-0 border-t border-border/40 space-y-4">
            {/* Gown inventory tags */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">学士服储备支持</span>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(photographer.gowns_json) && photographer.gowns_json.length > 0 ? (
                  (photographer.gowns_json as { degree?: string; size?: string }[]).map(
                    (g, i) => (
                      <Badge key={i} variant="outline" className="border-border/60 text-xs text-muted-foreground bg-muted/20 px-3 py-0.5 rounded-lg">
                        🎓 {g.degree} - {g.size}
                      </Badge>
                    )
                  )
                ) : (
                  <Badge variant="outline" className="border-border/60 text-xs text-muted-foreground bg-muted/20 px-3 py-0.5 rounded-lg">
                    🎓 学生自备学士服
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5">
                <Clock className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> {COPY.PHOTOGRAPHER_PAGE.PAYMENT_VIA_WECHAT}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5">
                <GraduationCap className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> 杜伦大学官方取景
              </span>
              {(() => {
                const s = (photographer.settings_json as {
                  camera_model?: string;
                  delivery_promise?: string;
                } | null) || {};
                return (
                  <>
                    {s.camera_model && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5">
                        <Camera className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} /> {s.camera_model}
                      </span>
                    )}
                    {s.delivery_promise && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        ⏳ {s.delivery_promise}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Booking Calendar Overhaul */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-serif italic font-bold text-primary tracking-tight">
              {COPY.PHOTOGRAPHER_PAGE.AVAILABLE_SLOTS}
            </h2>
            <Badge variant="outline" className="bg-brand/5 border-brand/20 text-brand text-[10px] px-2 py-0">
              {slots.length} 档可用
            </Badge>
          </div>

          {booking && (
            <div className="p-3 bg-brand/10 border border-brand/25 text-brand text-xs font-semibold rounded-xl flex items-center gap-2 animate-pulse shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
              {COPY.PHOTOGRAPHER_PAGE.RESERVING}
            </div>
          )}

          <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <CalendarScheduler
              slots={slots}
              onBookSlot={handleBookSlot}
              mode="student"
            />
          </div>
        </div>

        {/* Portfolio Showcase Section */}
        <PortfolioShowcase
          portfolio={parsePortfolio(photographer.portfolio_json)}
          photographerName={photographer.full_name}
        />
      </div>
    </div>
  );
}
