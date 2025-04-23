
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface AddAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  date: Date;
  availableSlots: string[];
  onSuccess?: () => void;
}

export function AddAppointmentModal({
  open,
  onOpenChange,
  doctorId,
  date,
  availableSlots,
  onSuccess,
}: AddAppointmentModalProps) {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slot, setSlot] = useState("");
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSlot("");
    setPatientId("");
    // Fetch patients (could be optimized to limit to this doctor's patients)
    supabase
      .from("patients")
      .select("id, first_name, last_name")
      .then(({ data, error }) => {
        if (!error && data) setPatients(data);
      });
  }, [open]);

  const handleCreate = async () => {
    if (!slot || !patientId) return;

    setLoading(true);
    const formattedDate = date.toISOString().slice(0, 10);
    try {
      const { error } = await supabase.from("appointments").insert({
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_date: formattedDate,
        appointment_time: slot,
        status: "scheduled",
      });
      if (error) throw error;
      toast({
        title: "Appointment created",
        description: "The appointment was created successfully.",
      });
      onOpenChange(false);
      onSuccess && onSuccess();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create appointment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Time Slot</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full border rounded p-2"
              disabled={loading}
            >
              <option value="">Select a time slot</option>
              {availableSlots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Patient</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border rounded p-2"
              disabled={loading}
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!slot || !patientId || loading}
          >
            {loading ? "Creating..." : "Create Appointment"}
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              type="button"
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
