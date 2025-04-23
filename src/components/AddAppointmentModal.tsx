
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
  const [patientMode, setPatientMode] = useState<"existing" | "guest">("existing");
  // Guest fields:
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSlot("");
    setPatientId("");
    setGuestFirstName("");
    setGuestLastName("");
    setGuestPhone("");
    setPatientMode("existing");
    // Fetch patients
    supabase
      .from("patients")
      .select("id, first_name, last_name")
      .then(({ data, error }) => {
        if (!error && data) setPatients(data);
      });
  }, [open]);

  const isGuestValid = guestFirstName.trim() !== "" && guestLastName.trim() !== "";

  const handleCreate = async () => {
    if (!slot) return;

    setLoading(true);
    const formattedDate = date.toISOString().slice(0, 10);

    try {
      let appointmentPatientId = "";
      let isGuest = patientMode === "guest";

      if (isGuest) {
        if (!isGuestValid) {
          toast({
            variant: "destructive",
            title: "Missing info",
            description: "Guest first and last name are required.",
          });
          setLoading(false);
          return;
        }
        // Insert guest patient and use its id
        const { data: guestData, error: guestError } = await supabase
          .from("guest_patient")
          .insert({
            first_name: guestFirstName,
            last_name: guestLastName,
            phone: guestPhone,
          })
          .select("id")
          .single();
        if (guestError || !guestData) {
          throw guestError || new Error("Could not add guest patient");
        }
        appointmentPatientId = guestData.id;
      } else {
        if (!patientId) {
          setLoading(false);
          return;
        }
        appointmentPatientId = patientId;
      }

      const { error } = await supabase.from("appointments").insert({
        doctor_id: doctorId,
        patient_id: appointmentPatientId,
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
            <label className="block mb-1 text-sm font-medium">Patient Type</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  value="existing"
                  checked={patientMode === "existing"}
                  onChange={() => setPatientMode("existing")}
                  disabled={loading}
                />
                Existing Patient
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  value="guest"
                  checked={patientMode === "guest"}
                  onChange={() => setPatientMode("guest")}
                  disabled={loading}
                />
                Guest Patient
              </label>
            </div>
          </div>
          {patientMode === "existing" && (
            <div>
              <label className="block mb-1 text-sm font-medium">Select Patient</label>
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
          )}
          {patientMode === "guest" && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Guest First Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Guest Last Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Guest Phone</label>
                <input
                  type="tel"
                  className="w-full border rounded p-2"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={
              !slot ||
              loading ||
              (patientMode === "existing"
                ? !patientId
                : !isGuestValid)
            }
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
