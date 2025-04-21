
import { useState } from "react";
import { AppointmentStatusMenu } from "./AppointmentStatusMenu";
import { ViewPatientModal } from "./ViewPatientModal";
import { RescheduleModal } from "./RescheduleModal";
import { InternalNoteModal } from "./InternalNoteModal";
import { Button } from "@/components/ui/button";
import { User, CalendarClock, Note, Edit } from "lucide-react";

export function AppointmentActions({ appointment, refresh }: { appointment: any, refresh: () => void }) {
  const [viewPatientOpen, setViewPatientOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [internalNoteOpen, setInternalNoteOpen] = useState(false);

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
        <Note className="w-4 h-4" />
      </Button>
      <InternalNoteModal appointment={appointment} open={internalNoteOpen} onOpenChange={setInternalNoteOpen} onSaved={refresh} />
    </div>
  );
}
