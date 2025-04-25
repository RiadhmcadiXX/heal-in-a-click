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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSlot("");
    setPatientId("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setPatientMode("existing");
    
    supabase
      .from("patients")
      .select("id, first_name, last_name")
      .then(({ data, error }) => {
        if (!error && data) setPatients(data);
      });
  }, [open]);

  const isNewPatientValid = firstName.trim() !== "" && lastName.trim() !== "";

  const handleCreate = async () => {
    if (!slot) return;

    setLoading(true);
    const formattedDate = date.toISOString().slice(0, 10);

    try {
      if (patientMode === "new") {
        if (!isNewPatientValid) {
          toast({
            variant: "destructive",
            title: "Missing info",
            description: "First and last name are required.",
          });
          setLoading(false);
          return;
        }
        const { data: newPatient, error: patientError } = await supabase
          .from("patients")
          .insert({
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            user_id: null
          })
          .select("id")
          .single();

        if (patientError || !newPatient) {
          throw patientError || new Error("Could not create patient");
        }

        const { error } = await supabase.from("appointments").insert({
          doctor_id: doctorId,
          patient_id: newPatient.id,
          guest_patient_id: null,
          appointment_date: formattedDate,
          appointment_time: slot,
          status: "scheduled",
        });

        if (error) throw error;
      } else {
        if (!patientId) {
          toast({
            variant: "destructive",
            title: "Missing info",
            description: "Please select a patient.",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.from("appointments").insert({
          doctor_id: doctorId,
          patient_id: patientId,
          guest_patient_id: null,
          appointment_date: formattedDate,
          appointment_time: slot,
          status: "scheduled",
        });

        if (error) throw error;
      }

      toast({
        title: "Appointment created",
        description: "The appointment was created successfully.",
      });
      onOpenChange(false);
      onSuccess && onSuccess();
    } catch (err) {
      console.error("Error creating appointment:", err);
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
            <Label className="block mb-1">Time Slot</Label>
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
            <Label className="block mb-1">Patient Type</Label>
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
                  value="new"
                  checked={patientMode === "new"}
                  onChange={() => setPatientMode("new")}
                  disabled={loading}
                />
                New Patient
              </label>
            </div>
          </div>
          {patientMode === "existing" && (
            <div>
              <Label className="block mb-1">Select Patient</Label>
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
          {patientMode === "new" && (
            <div className="space-y-2">
              <div>
                <Label>First Name<span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <Label>Last Name<span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                : !isNewPatientValid)
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
