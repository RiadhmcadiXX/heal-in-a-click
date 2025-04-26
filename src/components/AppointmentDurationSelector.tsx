
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppointmentDurationSelectorProps {
  doctorId: string;
  currentDuration?: number;
  onDurationChange?: (duration: number) => void;
}

export function AppointmentDurationSelector({ 
  doctorId, 
  currentDuration,
  onDurationChange 
}: AppointmentDurationSelectorProps) {
  const [duration, setDuration] = useState(currentDuration || 60);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleDurationChange = async () => {
    setIsUpdating(true);
    try {
      // Use type assertion to avoid type errors, since we know the column exists in the database
      const { error } = await supabase
        .from('doctors')
        .update({ appointment_duration: duration } as any)
        .eq('id', doctorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment duration updated successfully",
      });
      
      onDurationChange?.(duration);
    } catch (error) {
      console.error('Error updating duration:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update appointment duration",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="space-y-2">
        <Label>Appointment Duration (minutes)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={15}
            max={180}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-24"
          />
          <Button 
            onClick={handleDurationChange}
            disabled={isUpdating || duration === currentDuration}
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Choose between 15 and 180 minutes per appointment
        </p>
      </div>
    </div>
  );
}
