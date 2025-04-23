
import { useState } from "react";
import { AppointmentStatusMenu } from "./AppointmentStatusMenu";
import { ViewPatientModal } from "./ViewPatientModal";
import { RescheduleModal } from "./RescheduleModal";
import { InternalNoteModal } from "./InternalNoteModal";
import { Button } from "@/components/ui/button";
import { User, CalendarClock, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AppointmentActions({ appointment, refresh }: { appointment: any, refresh: () => void }) {
  const [viewPatientOpen, setViewPatientOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [internalNoteOpen, setInternalNoteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    // Delete the appointment
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointment.id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not delete the appointment.",
      });
    } else {
      toast({
        title: "Appointment deleted",
        description: "The appointment has been removed.",
      });
      refresh();
    }
    setDeleting(false);
    setDeleteConfirm(false);
  };

  return (
    <div className="flex gap-1">
      <AppointmentStatusMenu appointment={appointment} refresh={refresh} />

      <Button variant="ghost" size="icon" onClick={() => setViewPatientOpen(true)} title="View patient info">
        <User className="w-4 h-4" />
      </Button>
      <ViewPatientModal appointment={appointment} open={viewPatientOpen} onOpenChange={setViewPatientOpen} />

      <Button variant="ghost" size="icon" onClick={() => setRescheduleOpen(true)} title="Reschedule">
        <CalendarClock className="w-4 h-4" />
      </Button>
      <RescheduleModal appointment={appointment} open={rescheduleOpen} onOpenChange={setRescheduleOpen} onRescheduled={refresh} />

      <Button variant="ghost" size="icon" onClick={() => setInternalNoteOpen(true)} title="Add internal note">
        <Edit className="w-4 h-4" />
      </Button>
      <InternalNoteModal appointment={appointment} open={internalNoteOpen} onOpenChange={setInternalNoteOpen} onSaved={refresh} />

      {/* Delete Button and Confirmation Modal */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDeleteConfirm(true)}
        title="Delete Appointment"
        className="text-red-500 hover:bg-red-100"
        disabled={deleting}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <p className="mb-4 text-sm text-gray-700">
              Are you sure you want to delete this appointment?<br />
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
