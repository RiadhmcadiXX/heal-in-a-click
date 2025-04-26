
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
      const statusMessage = status === 'cancelled' 
        ? `Appointment cancelled${cancelReason ? `: ${cancelReason}` : ''}`
        : `Appointment marked as ${status}`;

      toast({ 
        title: "Status Updated",
        description: `${appointment.patients?.first_name} ${appointment.patients?.last_name} - ${statusMessage}`
      });
      refresh();
    }
  }

  // Early return to show limited options for completed/cancelled appointments
  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="Status options">
            <Info className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52">
          <div className="text-sm text-gray-500 p-2">
            This appointment is {appointment.status.toLowerCase()}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Manage status">
          <Info className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 flex flex-col gap-2">
        {appointment.status === 'pending' && (
          <>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => updateStatus("accepted")}
            >
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Accept Appointment
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-red-600 hover:text-red-600"
              onClick={() => updateStatus("refused")}
            >
              <X className="w-4 h-4 mr-2" />
              Refuse Appointment
            </Button>
          </>
        )}
        
        {appointment.status === 'accepted' && (
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => updateStatus("completed")}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark as Completed
          </Button>
        )}

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
                setCanceling(false); 
                setCancelReason("");
              }}
            >
              Confirm Cancel
            </Button>
          </PopoverContent>
        </Popover>

        {appointment.status === 'accepted' && (
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => updateStatus("no-show")}
          >
            <CalendarX className="w-4 h-4 mr-2" />
            Mark as No-Show
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
