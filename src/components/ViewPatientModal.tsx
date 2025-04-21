
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

export function ViewPatientModal({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const pat = appointment.patients || {};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            Patient Info
          </DialogTitle>
        </DialogHeader>
        <div className="mb-2">
          <strong>Name: </strong>
          {pat.first_name} {pat.last_name}
        </div>
        <div className="mb-2">
          <strong>Contact: </strong>
          {pat.phone || <span className="text-gray-400">No Phone</span>}
        </div>
        <div className="mb-2">
          <strong>Appointment Notes: </strong>
          {appointment.notes || <span className="text-gray-400">No notes</span>}
        </div>
        <DialogClose asChild>
          <button className="mt-3 px-4 py-1 rounded bg-gray-200 hover:bg-gray-300">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
