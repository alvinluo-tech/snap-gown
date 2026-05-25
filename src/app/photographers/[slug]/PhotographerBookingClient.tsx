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
import { Camera, ArrowLeft } from "lucide-react";
import { penceToPounds, penceToRMB } from "@/lib/utils";
import Link from "next/link";

interface Photographer {
  id: string;
  full_name: string;
  bio: string | null;
  gowns_json: unknown;
  wechat_qr_url: string | null;
  account_status: string | null;
}

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

// Default price: £150
const DEFAULT_PRICE_PENCE = 15000;

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
      const order = await bookSlot(
        slot.id,
        photographer.id,
        DEFAULT_PRICE_PENCE
      );
      toast.success("Slot reserved! Complete payment within 30 minutes.");
      router.push(`/checkout/${order.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Booking failed"
      );
    }
    setBooking(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SnapGown</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Photographer Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {photographer.full_name}
              </CardTitle>
              <Badge>Photographer</Badge>
            </div>
            {photographer.bio && (
              <CardDescription>{photographer.bio}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">
                Price: £{penceToPounds(DEFAULT_PRICE_PENCE)} (¥
                {penceToRMB(DEFAULT_PRICE_PENCE)})
              </span>
              <span className="text-muted-foreground">
                Payment via WeChat
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {Array.isArray(photographer.gowns_json) &&
                (photographer.gowns_json as { degree?: string; size?: string }[]).map(
                  (g, i) => (
                    <Badge key={i} variant="outline">
                      {g.degree} - {g.size}
                    </Badge>
                  )
                )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Calendar */}
        <h2 className="text-xl font-bold mb-4">Available Time Slots</h2>
        {booking && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">
            Reserving your slot... Please wait.
          </div>
        )}
        <CalendarScheduler
          slots={slots}
          onBookSlot={handleBookSlot}
          mode="student"
        />
      </div>
    </div>
  );
}
