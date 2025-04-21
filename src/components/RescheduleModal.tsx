
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function RescheduleModal({
  appointment,
  open,
  onOpenChange,
  onRescheduled,
}: {
  appointment: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRescheduled: () => void;
}) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReschedule() {
    if (!selectedDate || !time) return;
    setSubmitting(true);

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const { error } = await supabase.from("appointments").update({
      appointment_date: formattedDate,
      appointment_time: time,
    }).eq("id", appointment.id);

    setSubmitting(false);
    if (error) {
      toast({ variant: "destructive", title: "Could not reschedule." });
    } else {
      toast({ title: "Rescheduled!" });
      onRescheduled();
      onOpenChange(false);
    }
  }

  // Times in 30min intervals
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 8 + Math.floor(i/2);
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${min}`;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="mb-2">
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
        </div>
        <div className="mb-2">
          <select
            className="w-full border p-2 rounded"
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            <option value="">Select time...</option>
            {timeSlots.map(t => <option value={t} key={t}>{t}</option>)}
          </select>
        </div>
        <DialogFooter>
          <Button onClick={submitReschedule} disabled={!selectedDate || !time || submitting}>
            Save
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
