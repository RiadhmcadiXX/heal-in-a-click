
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface AvailabilityTimeSlotsProps {
  selectedDate: Date | undefined;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  onSave: () => void;
  isSubmitting: boolean;
  timeSlots: Array<{ label: string; value: string }>;
}

export function AvailabilityTimeSlots({
  selectedDate,
  selectedSlots,
  onSlotsChange,
  onSave,
  isSubmitting,
  timeSlots,
}: AvailabilityTimeSlotsProps) {
  
  const handleSlotToggle = (time: string) => {
    onSlotsChange(
      selectedSlots.includes(time)
        ? selectedSlots.filter(slot => slot !== time)
        : [...selectedSlots, time]
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {selectedDate ? `Available Times for ${format(selectedDate, 'MMMM d, yyyy')}` : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDate && (
          <div className="space-y-4">
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <div key={slot.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={slot.value}
                    checked={selectedSlots.includes(slot.value)}
                    onCheckedChange={() => handleSlotToggle(slot.value)}
                  />
                  <Label htmlFor={slot.value}>{slot.label}</Label>
                </div>
              ))}
            </div>

            <Button
              onClick={onSave}
              className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Availability"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
