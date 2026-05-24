"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: string;
  photographer_id: string;
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
    <div className="flex flex-col lg:flex-row gap-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            hasSlots: (date) =>
              datesWithSlots.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersStyles={{
            hasSlots: {
              fontWeight: "bold",
              textDecoration: "underline",
            },
          }}
        />
      </div>

      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? format(selectedDate, "EEEE, MMMM d, yyyy")
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slotsForDate.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No slots available for this date.
              </p>
            ) : (
              <div className="space-y-3">
                {slotsForDate.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </span>
                      {slot.profiles && (
                        <span className="text-sm text-muted-foreground">
                          {slot.profiles.full_name}
                        </span>
                      )}
                      <Badge
                        variant={
                          slot.status === "AVAILABLE"
                            ? "default"
                            : slot.status === "HELD"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {slot.status}
                      </Badge>
                    </div>
                    {mode === "student" && slot.status === "AVAILABLE" && onBookSlot && (
                      <Button size="sm" onClick={() => onBookSlot(slot)}>
                        Book Now
                      </Button>
                    )}
                    {mode === "photographer" &&
                      slot.status === "AVAILABLE" &&
                      onDeleteSlot && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteSlot(slot.id)}
                        >
                          Delete
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
