"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, ArrowRight, GraduationCap, ChevronLeft, ChevronRight, Eye, Sparkles, ShieldCheck, Zap, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import COPY from "@/lib/constants/copy";

interface Photographer {
  id: string;
  slug: string | null;
  full_name: string;
  bio: string | null;
  gowns_json: unknown;
  account_status: string | null;
  avatar_url: string | null;
  portfolio_json: unknown;
  settings_json?: unknown;
}

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

interface PhotographerListClientProps {
  initialPhotographers: Photographer[];
}

type StyleFilter = "all" | "cathedral" | "castle" | "portrait";

export function PhotographerListClient({ initialPhotographers }: PhotographerListClientProps) {
  const [activeFilter, setActiveFilter] = useState<StyleFilter>("all");
  const [cardImageIndices, setCardImageIndices] = useState<Record<string, number>>({});
  const [activeLightboxPhotographer, setActiveLightboxPhotographer] = useState<Photographer | null>(null);

  const touchStartX = useRef<number>(0);

  const getActiveImageIndex = (id: string) => cardImageIndices[id] || 0;

  const handlePrevImage = (e: React.MouseEvent | React.TouchEvent, p: Photographer, images: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    const currIndex = getActiveImageIndex(p.id);
    const nextIndex = currIndex > 0 ? currIndex - 1 : images.length - 1;
    setCardImageIndices((prev) => ({ ...prev, [p.id]: nextIndex }));
  };

  const handleNextImage = (e: React.MouseEvent | React.TouchEvent, p: Photographer, images: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    const currIndex = getActiveImageIndex(p.id);
    const nextIndex = currIndex < images.length - 1 ? currIndex + 1 : 0;
    setCardImageIndices((prev) => ({ ...prev, [p.id]: nextIndex }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, p: Photographer, images: string[]) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // 50px threshold for swipes
      e.preventDefault();
      e.stopPropagation();

      if (diff > 0) {
        // Swipe left -> Next image
        const currIndex = getActiveImageIndex(p.id);
        const nextIndex = currIndex < images.length - 1 ? currIndex + 1 : 0;
        setCardImageIndices((prev) => ({ ...prev, [p.id]: nextIndex }));
      } else {
        // Swipe right -> Prev image
        const currIndex = getActiveImageIndex(p.id);
        const nextIndex = currIndex > 0 ? currIndex - 1 : images.length - 1;
        setCardImageIndices((prev) => ({ ...prev, [p.id]: nextIndex }));
      }
    }
  };

  const handleOpenLightbox = (e: React.MouseEvent, p: Photographer) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveLightboxPhotographer(p);
  };

  // Smart Client-side Aesthetic Filter Logic (Bypasses remote DB schema limits)
  const filteredPhotographers = useMemo(() => {
    if (activeFilter === "all") return initialPhotographers;
    
    return initialPhotographers.filter((p) => {
      const bio = (p.bio || "").toLowerCase();
      const name = (p.full_name || "").toLowerCase();
      
      if (activeFilter === "cathedral") {
        return (
          bio.includes("教堂") || 
          bio.includes("cathedral") || 
          bio.includes("光景") || 
          bio.includes("光影") ||
          bio.includes("主教") ||
          bio.includes("室外")
        );
      }
      if (activeFilter === "castle") {
        return (
          bio.includes("城堡") || 
          bio.includes("castle") || 
          bio.includes("户外") || 
          bio.includes("外拍") ||
          bio.includes("校区") ||
          bio.includes("mary")
        );
      }
      if (activeFilter === "portrait") {
        return (
          bio.includes("人像") || 
          bio.includes("portrait") || 
          bio.includes("精修") || 
          bio.includes("细腻") ||
          bio.includes("特写") ||
          bio.includes("影棚")
        );
      }
      return true;
    });
  }, [initialPhotographers, activeFilter]);

  // Generate setting badges from real settings_json, fall back to bio-based inference
  const getStyleBadges = (p: Photographer) => {
    const settings = (p.settings_json as {
      default_price_pounds?: number;
      camera_model?: string;
      delivery_promise?: string;
    } | null) || {};
    const bio = (p.bio || "").toLowerCase();
    const badges = [];

    // Style tag — derived from bio
    if (bio.includes("教堂") || bio.includes("cathedral") || bio.includes("光影")) {
      badges.push({ text: "✨ 大教堂光影专家", variant: "brand" });
    } else if (bio.includes("城堡") || bio.includes("castle") || bio.includes("外拍")) {
      badges.push({ text: "🏰 城堡外拍熟手", variant: "brand" });
    } else {
      badges.push({ text: "📐 杜伦Cathedral熟手", variant: "brand" });
    }

    // Camera — only show when real data exists
    if (settings.camera_model) {
      badges.push({ text: `📸 ${settings.camera_model}`, variant: "secondary" });
    }

    // Delivery — only show when real data exists
    if (settings.delivery_promise) {
      badges.push({ text: `⏳ ${settings.delivery_promise}`, variant: "accent" });
    }

    return badges;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* ======================================================== */}
      {/* LEFT COLUMN - Sticky Editorial Visual Showcase Cover     */}
      {/* ======================================================== */}
      <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-8 text-left bg-gradient-to-br from-card/30 to-muted/10 p-6 md:p-8 rounded-3xl border border-border/40 backdrop-blur-md shadow-xs animate-in fade-in slide-in-from-left-4 duration-500">
        
        {/* Decorative Top Accent */}
        <Badge variant="outline" className="border-brand/40 text-brand bg-brand/10 uppercase tracking-widest text-[9px] px-3.5 py-1 rounded-full font-bold">
          Durham Pilot · 2026
        </Badge>

        {/* Display Serif Header with Descender clearance */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold tracking-tight text-primary leading-[1.12] pb-1">
            寻找属于您的<br />
            <span className="text-brand">叙事光影</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[28ch] font-sans font-light">
            用影像定格您永恒的英伦礼赞。我们优秀的摄影师熟悉杜伦每一处快门黄金点。
          </p>
        </div>

        {/* Smart Aesthetic Filters Chips (Luxury gold style) */}
        <div className="space-y-3 pt-4 border-t border-border/40">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold font-sans block mb-1">
            Aesthetic Filters / 艺术风格筛选
          </span>
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: "all", label: "全部独立摄影师" },
              { id: "cathedral", label: "🏛️ 大教堂光影" },
              { id: "castle", label: "🏰 城堡外拍熟手" },
              { id: "portrait", label: "🎭 细腻人像精修" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as StyleFilter)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-brand text-brand-foreground shadow-sm shadow-brand/10 border border-brand"
                    : "bg-muted/40 hover:bg-muted/80 text-muted-foreground border border-border/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trust statistics capsule */}
        <div className="space-y-3 pt-6 border-t border-border/40">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold font-sans block mb-1">
            Verified Standards / 平台信任保障
          </span>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-brand/20 transition-all duration-300">
              <div className="p-2 rounded-xl bg-brand/10 text-brand">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-primary">100% 杜伦校友摄影师</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">熟悉本校圣玛丽、Cathedral等机位</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-brand/20 transition-all duration-300">
              <div className="p-2 rounded-xl bg-brand/10 text-brand">
                <Zap className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-primary">微信扫码 担保核对</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">不代收资金，学生直接扫码付给个人</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN - Spacious Lookbook Flow of Widescreen Cards */}
      {/* ======================================================== */}
      <div className="lg:col-span-8 space-y-12">
        
        {filteredPhotographers.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl bg-card/40 backdrop-blur-xs">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40 animate-pulse" strokeWidth={1} />
            <p className="text-sm font-semibold text-muted-foreground">该风格下暂无上架摄影师</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-4 px-4 py-2 bg-brand text-brand-foreground rounded-xl text-xs font-semibold hover:bg-brand/90 transition-all cursor-pointer"
            >
              返回展示全部摄影师
            </button>
          </div>
        ) : (
          filteredPhotographers.map((p, index) => {
            const isGoldCard = index % 2 === 0;
            const portfolioImages = parsePortfolio(p.portfolio_json);
            const activeIdx = getActiveImageIndex(p.id);
            const hasPortfolio = portfolioImages.length > 0;
            const styleBadges = getStyleBadges(p);

            return (
              <div key={p.id} className="group relative animate-in fade-in slide-in-from-bottom-6 duration-500">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-brand/3 opacity-0 group-hover:opacity-100 blur-3xl rounded-[32px] transition-opacity duration-700 pointer-events-none" />

                <Card className={`hover-lift border border-border/60 cursor-pointer h-full overflow-hidden flex flex-col justify-between rounded-[32px] transition-all duration-500 ease-out shadow-sm relative ${
                  isGoldCard 
                    ? 'bg-gradient-to-br from-brand-light/10 via-card to-card hover:border-brand/40' 
                    : 'bg-card hover:border-brand/30'
                }`}>
                  
                  <Link href={`/photographers/${p.slug || p.id}`} className="flex flex-col h-full justify-between">
                    <div>
                      
                      {/* Media container - Expanded to cinematic widescreen 16:9 */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/20 border-b border-border/40 group/media">
                        {hasPortfolio ? (
                          <div 
                            className="relative w-full h-full"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={(e) => handleTouchEnd(e, p, portfolioImages)}
                          >
                            <Image
                              src={portfolioImages[activeIdx]}
                              alt={`${p.full_name} 摄影代表作`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 55vw"
                              priority={index < 2}
                              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                            />

                            {/* Slide Navigation Overlay Trigger Arrows */}
                            {portfolioImages.length > 1 && (
                              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-70 sm:opacity-0 sm:group-hover/media:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <button
                                  onClick={(e) => handlePrevImage(e, p, portfolioImages)}
                                  onTouchEnd={(e) => handlePrevImage(e, p, portfolioImages)}
                                  className="p-2 rounded-full bg-black/55 border border-white/10 text-white backdrop-blur-xs active:scale-95 transition-all cursor-pointer pointer-events-auto shadow-sm"
                                  aria-label="Previous preview"
                                >
                                  <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={(e) => handleNextImage(e, p, portfolioImages)}
                                  onTouchEnd={(e) => handleNextImage(e, p, portfolioImages)}
                                  className="p-2 rounded-full bg-black/55 border border-white/10 text-white backdrop-blur-xs active:scale-95 transition-all cursor-pointer pointer-events-auto shadow-sm"
                                  aria-label="Next preview"
                                >
                                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                              </div>
                            )}

                            {/* Eyeball icon trigger for Instant Fullscreen Lightbox */}
                            <button
                              onClick={(e) => handleOpenLightbox(e, p)}
                              className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-black/50 border border-white/15 text-white backdrop-blur-md opacity-0 group-hover/media:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg transform scale-90 group-hover/media:scale-100 hover:bg-brand hover:text-brand-foreground hover:border-brand cursor-pointer"
                              title="Instant Fullscreen Lightbox"
                            >
                              <Eye className="h-6 w-6" strokeWidth={1.75} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-brand-light/20 to-brand/5 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: "url('/images/durham_graduation_hero.png')" }} />
                            <Camera className="h-8 w-8 text-brand/50 animate-pulse relative z-10" strokeWidth={1.5} />
                          </div>
                        )}

                        {/* Top Gradient for protection */}
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                        
                        {/* Bottom Masking Gradient */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

                        {/* Gold starting rate floating tag */}
                        <div className="absolute top-4 left-4 academic-glass border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Award className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
                          <span className="text-[10px] font-semibold text-white tracking-widest uppercase">Verified Pilot</span>
                        </div>

                        {/* Works Count Indicator Overlay */}
                        {hasPortfolio && (
                          <Badge className="absolute bottom-4 right-4 bg-black/60 text-white backdrop-blur-md text-[9px] uppercase tracking-widest border-none px-2.5 py-1 font-sans font-bold shadow-sm rounded-md">
                            Portfolio · {portfolioImages.length}P
                          </Badge>
                        )}

                        {/* Active Progress Stripe Indicators */}
                        {portfolioImages.length > 1 && (
                          <div className="absolute bottom-4 left-4 flex gap-1.5 items-center bg-black/35 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
                            {portfolioImages.map((_, i) => (
                              <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  activeIdx === i ? "w-4 bg-brand" : "w-1.5 bg-white/40"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Asymmetric Profile Overlap Details */}
                      <div className="px-8 pt-8 pb-4 relative">
                        {/* Luxury floating Avatar overlap capsule */}
                        <div className="absolute -top-11 right-8 h-18 w-18 border-3 border-card bg-card rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                          {p.avatar_url ? (
                            <Image src={p.avatar_url} alt={p.full_name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-brand/10 flex items-center justify-center font-serif text-brand text-xl font-bold">
                              {p.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 max-w-[calc(100%-80px)]">
                          <h3 className="text-xl font-serif italic font-bold text-primary group-hover:text-brand transition-colors duration-300 tracking-tight">
                            {p.full_name}
                          </h3>
                          <Badge variant="secondary" className="bg-brand/10 text-brand border-brand/20 font-medium text-[9px] tracking-wide uppercase px-2 py-0.5 rounded-md">
                            {COPY.HOME.PHOTOGRAPHER_BADGE}
                          </Badge>
                        </div>
                        
                        {p.bio && (
                          <p className="text-xs text-muted-foreground/90 line-clamp-2 mt-5 leading-relaxed font-sans font-light max-w-[65ch]">
                            {p.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Specifications & CTAs */}
                    <div className="px-8 pb-8 pt-4 border-t border-border/40">
                      {/* Highly professional custom tags per photographer */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {styleBadges.map((badge, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className={`text-[9px] px-2.5 py-0.5 rounded-md font-sans border-none shadow-xs ${
                              badge.variant === "brand" 
                                ? "bg-brand/10 text-brand font-medium" 
                                : badge.variant === "accent"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                                  : "bg-muted text-muted-foreground font-light"
                            }`}
                          >
                            {badge.text}
                          </Badge>
                        ))}
                      </div>

                      {/* View details action trigger */}
                      <Button className="w-full tactile-btn bg-secondary text-secondary-foreground group-hover:bg-brand group-hover:text-brand-foreground transition-colors duration-300 py-6 rounded-2xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2">
                        <span>{COPY.HOME.VIEW_SLOTS_BOOK}</span>
                        <ArrowRight className="h-4 w-4 opacity-80" strokeWidth={2} />
                      </Button>
                    </div>

                  </Link>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Global Quick View Fullscreen Lightbox Portal */}
      {activeLightboxPhotographer && (
        <PortfolioShowcase
          portfolio={parsePortfolio(activeLightboxPhotographer.portfolio_json)}
          photographerName={activeLightboxPhotographer.full_name}
          initialOpenIndex={0}
          showGrid={false}
          onClose={() => setActiveLightboxPhotographer(null)}
        />
      )}
    </div>
  );
}
