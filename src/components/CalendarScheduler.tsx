"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import COPY from "@/lib/constants/copy";
import { penceToPounds } from "@/lib/utils";

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

interface CalendarSchedulerProps {
  slots: Slot[];
  onBookSlot?: (slot: Slot) => void;
  mode?: "student" | "photographer";
  onDeleteSlot?: (slotId: string) => void;
}

export function CalendarScheduler({
  slots,
  onBookSlot,
  mode = "student",
  onDeleteSlot,
}: CalendarSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const selectedDateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

  const slotsForDate = slots.filter((s) => s.slot_date === selectedDateStr);

  // Get dates that have available slots
  const datesWithSlots = new Set(
    slots.filter((s) => s.status === "AVAILABLE").map((s) => s.slot_date)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Calendar Side Pane */}
      <div className="mx-auto lg:mx-0 p-3 bg-muted/30 border border-border/80 rounded-2xl shadow-xs">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-xl border-none bg-transparent"
          modifiers={{
            hasSlots: (date) =>
              datesWithSlots.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersStyles={{
            hasSlots: {
              fontWeight: "700",
              color: "oklch(0.76 0.13 85)",
              border: "1px solid oklch(0.76 0.13 85 / 30%)",
              borderRadius: "8px",
            },
          }}
        />
      </div>

      {/* Slots Details List Pane */}
      <div className="flex-1 w-full">
        <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
          <CardHeader className="pt-6 px-6 pb-2 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-base font-serif italic font-bold text-primary">
              {selectedDate
                ? format(selectedDate, "EEEE, MMMM d, yyyy")
                : COPY.COMPONENTS.SELECT_DATE}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {slotsForDate.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground/80 space-y-2">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/35" strokeWidth={1} />
                <p className="text-xs font-semibold">{COPY.COMPONENTS.NO_SLOTS_DATE}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slotsForDate.map((slot) => {
                  const isAvailable = slot.status === "AVAILABLE";
                  return (
                    <div
                      key={slot.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-xl relative overflow-hidden transition-all duration-300 gap-4 ${
                        isAvailable 
                          ? "border-border hover:border-brand/40 bg-background hover:shadow-sm" 
                          : "border-border/60 bg-muted/30 opacity-70"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`p-2 rounded-lg ${isAvailable ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"}`}>
                          <Clock className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-semibold text-sm text-primary block">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                          {slot.profiles && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
                              摄影师：{slot.profiles.full_name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                        <div className="flex items-center gap-2">
                          {slot.price_pence && (
                            <span className="text-sm font-mono font-bold text-primary">
                              £{penceToPounds(slot.price_pence)}
                            </span>
                          )}
                          <Badge
                            className="text-[9px] font-semibold tracking-wider rounded-md uppercase"
                            variant={
                              slot.status === "AVAILABLE"
                                ? "default"
                                : slot.status === "HELD"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {slot.status === "AVAILABLE" ? "可用档期" : slot.status === "HELD" ? "锁定中" : slot.status}
                          </Badge>
                        </div>

                        {mode === "student" && slot.status === "AVAILABLE" && onBookSlot && (
                          <Button size="sm" className="tactile-btn bg-brand text-brand-foreground hover:bg-brand/90 text-xs font-semibold" onClick={() => onBookSlot(slot)}>
                            {COPY.COMPONENTS.BOOK_NOW}
                          </Button>
                        )}
                        {mode === "photographer" &&
                          slot.status === "AVAILABLE" &&
                          onDeleteSlot && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="tactile-btn text-xs font-semibold"
                              onClick={() => onDeleteSlot(slot.id)}
                            >
                              {COPY.COMPONENTS.DELETE_SLOT}
                            </Button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
