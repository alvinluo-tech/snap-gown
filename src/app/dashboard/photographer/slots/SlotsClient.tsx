"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSlot, deleteSlot, batchCreateSlots } from "@/app/actions/slots";
import { CalendarScheduler } from "@/components/CalendarScheduler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Calendar } from "lucide-react";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: string;
  photographer_id: string;
}

export function PhotographerSlotsClient({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Single slot form
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Batch form
  const [batchStart, setBatchStart] = useState("");
  const [batchEnd, setBatchEnd] = useState("");
  const [batchStartTime, setBatchStartTime] = useState("");
  const [batchEndTime, setBatchEndTime] = useState("");

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("slot_date", slotDate);
      fd.append("start_time", startTime);
      fd.append("end_time", endTime);
      await createSlot(fd);
      toast.success("Slot created!");
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create slot");
    }
    setLoading(false);
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("start_date", batchStart);
      fd.append("end_date", batchEnd);
      fd.append("start_time", batchStartTime);
      fd.append("end_time", batchEndTime);
      const result = await batchCreateSlots(fd);
      toast.success(`${result.length} slots created!`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Batch creation failed");
    }
    setLoading(false);
  };

  const handleDelete = async (slotId: string) => {
    try {
      await deleteSlot(slotId);
      toast.success("Slot deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Create Time Slots
          </CardTitle>
          <CardDescription>
            Add available time slots for students to book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single">
            <TabsList>
              <TabsTrigger value="single">Single Slot</TabsTrigger>
              <TabsTrigger value="batch">Batch Create</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <form onSubmit={handleCreateSingle} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Slot"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="batch">
              <form onSubmit={handleBatchCreate} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={batchStart}
                      onChange={(e) => setBatchStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={batchEnd}
                      onChange={(e) => setBatchEnd(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={batchStartTime}
                      onChange={(e) => setBatchStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={batchEndTime}
                      onChange={(e) => setBatchEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Batch Create Slots"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Your Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarScheduler
            slots={slots}
            mode="photographer"
            onDeleteSlot={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
