
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X, Info, CalendarX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AppointmentStatusMenu({ appointment, refresh }: { appointment: any; refresh: () => void }) {
  const { toast } = useToast();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);

  async function updateStatus(status: string, extra: any = {}) {
    setPopoverOpen(false);
    const { error } = await supabase
      .from("appointments")
      .update({ status, ...extra })
      .eq("id", appointment.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    } else {
      toast({ title: "Success", description: `Marked as ${status}` });
      refresh();
    }
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Manage status">
          <Info className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 flex flex-col gap-2">
        <Button
          variant="ghost"
          className="justify-start"
          onClick={() => updateStatus("completed")}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark as Completed
        </Button>
        <Popover open={canceling} onOpenChange={setCanceling}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="justify-start w-full">
              <X className="w-4 h-4 mr-2" />
              Cancel Appointment
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <textarea
              className="w-full border rounded p-2 text-xs mb-2"
              placeholder="Optional reason"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={2}
            />
            <Button
              variant="destructive"
              className="w-full"
              onClick={async () => {
                await updateStatus("cancelled", { notes: cancelReason });
                setCanceling(false); setCancelReason("");
              }}
            >
              Confirm Cancel
            </Button>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          className="justify-start"
          onClick={() => updateStatus("no-show")}
        >
          <CalendarX className="w-4 h-4 mr-2" />
          Mark as No-Show
        </Button>
      </PopoverContent>
    </Popover>
  );
}
