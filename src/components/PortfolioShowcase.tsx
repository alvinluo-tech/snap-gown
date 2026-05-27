"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PortfolioShowcaseProps {
  portfolio: string[];
  photographerName: string;
  initialOpenIndex?: number | null;
  onClose?: () => void;
  showGrid?: boolean;
}

export function PortfolioShowcase({
  portfolio,
  photographerName,
  initialOpenIndex = null,
  onClose,
  showGrid = true,
}: PortfolioShowcaseProps) {
  const [index, setIndex] = useState<number | null>(initialOpenIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Swipe detection threshold
  const minSwipeDistance = 50;

  // Sync state if initialOpenIndex changes
  useEffect(() => {
    setIndex(initialOpenIndex);
    if (initialOpenIndex !== null) {
      document.body.style.overflow = "hidden";
    }
  }, [initialOpenIndex]);

  const handleOpen = (idx: number) => {
    setIndex(idx);
    document.body.style.overflow = "hidden"; // Lock scroll
  };

  const handleClose = useCallback(() => {
    setIndex(null);
    document.body.style.overflow = "unset"; // Restore scroll
    onClose?.();
  }, [onClose]);

  const handlePrev = useCallback(() => {
    if (index === null) return;
    setIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : portfolio.length - 1));
  }, [index, portfolio.length]);

  const handleNext = useCallback(() => {
    if (index === null) return;
    setIndex((prev) => (prev !== null && prev < portfolio.length - 1 ? prev + 1 : 0));
  }, [index, portfolio.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, handlePrev, handleNext, handleClose]);

  // Clean up body scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Swipe gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (!portfolio || portfolio.length === 0) {
    if (!showGrid) return null;
    return (
      <div className="text-center py-16 border border-dashed border-border/60 rounded-3xl bg-muted/20">
        <Camera className="h-10 w-10 text-muted-foreground/45 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">暂无作品展示</p>
      </div>
    );
  }

  return (
    <div className={showGrid ? "space-y-8" : ""}>
      {/* Asymmetric Magazine-Style Editorial Grid */}
      {showGrid && (
        <>
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-serif italic font-bold text-primary tracking-tight">
              作品展示 (Portfolio Showcase)
            </h2>
            <Badge variant="outline" className="bg-brand/5 border-brand/20 text-brand text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {portfolio.length} 精选代表作
            </Badge>
          </div>

          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 [column-fill:_balance]">
            {portfolio.map((url, idx) => {
              return (
                <div
                  key={idx}
                  className="break-inside-avoid mb-6 relative overflow-hidden rounded-[20px] border border-border/40 bg-muted/30 shadow-xs cursor-pointer group hover-lift transition-all duration-500 ease-out"
                  onClick={() => handleOpen(idx)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${photographerName} 作品展示 ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-cover rounded-[20px] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <div className="p-3.5 rounded-full bg-black/50 border border-white/20 text-white backdrop-blur-md shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Maximize2 className="h-5 w-5 text-brand" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[10px] uppercase tracking-widest text-white/90 font-semibold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      WORKS #{String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modern High-End Lightbox Modal */}
      {index !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 backdrop-blur-xl text-white select-none animate-in fade-in duration-300">
          
          {/* Top Panel - Controls & Metadata */}
          <header className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent relative z-10">
            <div className="flex flex-col">
              <span className="text-sm font-serif italic font-semibold text-brand tracking-wide">
                {photographerName}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
                毕业典礼精选作品 #{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            
            <button
              onClick={handleClose}
              className="p-3.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 hover:border-brand/40 text-zinc-300 hover:text-white transition-all duration-300 shadow-md transform hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Close Gallery"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </header>

          {/* Main Visual Stage */}
          <div 
            className="flex-1 flex items-center justify-center relative px-4 md:px-16"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              onClick={handlePrev}
              className="absolute left-6 z-10 p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 hover:border-brand/40 text-zinc-300 hover:text-white transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 hidden sm:flex items-center justify-center cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>

            <div className="relative w-full h-[65vh] md:h-[75vh] flex items-center justify-center select-none">
              <Image
                src={portfolio[index]}
                alt={`${photographerName} 作品大图 ${index + 1}`}
                fill
                className="object-contain pointer-events-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                sizes="100vw"
                priority
              />
            </div>

            <button
              onClick={handleNext}
              className="absolute right-6 z-10 p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 hover:border-brand/40 text-zinc-300 hover:text-white transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 hidden sm:flex items-center justify-center cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>

          {/* Bottom Panel - Index stripe & Thumbnails */}
          <footer className="w-full flex flex-col items-center gap-5 pb-6 pt-4 bg-gradient-to-t from-black/80 to-transparent relative z-10">
            <div className="px-3.5 py-1 bg-zinc-900/80 border border-white/10 rounded-full text-xs font-mono font-bold tracking-widest text-brand shadow-sm">
              {index + 1} / {portfolio.length}
            </div>

            <div className="flex items-center gap-3.5 px-6 overflow-x-auto max-w-full no-scrollbar pb-2">
              {portfolio.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setIndex(idx)}
                  className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 cursor-pointer ${
                    index === idx 
                      ? "border-brand scale-105 shadow-md shadow-brand/15" 
                      : "border-transparent opacity-40 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`缩略图 ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
