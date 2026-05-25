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
import COPY from "@/lib/constants/copy";

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
      toast.success(COPY.PHOTOGRAPHER_DASHBOARD.SLOT_CREATED);
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.PHOTOGRAPHER_DASHBOARD.SLOT_CREATE_FAILED);
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
      toast.success(COPY.PHOTOGRAPHER_DASHBOARD.SLOTS_BATCH_CREATED(result.length));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.PHOTOGRAPHER_DASHBOARD.BATCH_CREATE_FAILED);
    }
    setLoading(false);
  };

  const handleDelete = async (slotId: string) => {
    try {
      await deleteSlot(slotId);
      toast.success(COPY.PHOTOGRAPHER_DASHBOARD.SLOT_DELETED);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.PHOTOGRAPHER_DASHBOARD.SLOT_DELETE_FAILED);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> {COPY.PHOTOGRAPHER_DASHBOARD.CREATE_SLOTS_TITLE}
          </CardTitle>
          <CardDescription>
            {COPY.PHOTOGRAPHER_DASHBOARD.CREATE_SLOTS_DESC}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single">
            <TabsList>
              <TabsTrigger value="single">{COPY.PHOTOGRAPHER_DASHBOARD.SINGLE_SLOT}</TabsTrigger>
              <TabsTrigger value="batch">{COPY.PHOTOGRAPHER_DASHBOARD.BATCH_CREATE}</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <form onSubmit={handleCreateSingle} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{COPY.COMMON.DATE}</Label>
                    <Input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{COPY.PHOTOGRAPHER_DASHBOARD.START_TIME}</Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{COPY.PHOTOGRAPHER_DASHBOARD.END_TIME}</Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? COPY.COMMON.CREATING : COPY.PHOTOGRAPHER_DASHBOARD.CREATE_SLOT}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="batch">
              <form onSubmit={handleBatchCreate} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{COPY.PHOTOGRAPHER_DASHBOARD.START_DATE}</Label>
                    <Input
                      type="date"
                      value={batchStart}
                      onChange={(e) => setBatchStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{COPY.PHOTOGRAPHER_DASHBOARD.END_DATE}</Label>
                    <Input
                      type="date"
                      value={batchEnd}
                      onChange={(e) => setBatchEnd(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{COPY.PHOTOGRAPHER_DASHBOARD.START_TIME}</Label>
                    <Input
                      type="time"
                      value={batchStartTime}
                      onChange={(e) => setBatchStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{COPY.PHOTOGRAPHER_DASHBOARD.END_TIME}</Label>
                    <Input
                      type="time"
                      value={batchEndTime}
                      onChange={(e) => setBatchEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? COPY.COMMON.CREATING : COPY.PHOTOGRAPHER_DASHBOARD.BATCH_CREATE_SLOTS}
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
            <Calendar className="h-5 w-5" /> {COPY.PHOTOGRAPHER_DASHBOARD.YOUR_SLOTS}
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
