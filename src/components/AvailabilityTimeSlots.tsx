
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { WeeklyAvailabilitySelector } from "./WeeklyAvailabilitySelector";

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
}: AvailabilityTimeSlotsProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [showWeeklySelector, setShowWeeklySelector] = useState(false);

  const handleAddTimeRange = () => {
    // Convert the time range into individual slots based on appointment duration
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const slots = [];

    while (start < end) {
      slots.push(format(start, 'HH:mm:00'));
      start.setHours(start.getHours() + 1); // This should be based on appointment duration
    }

    onSlotsChange([...new Set([...selectedSlots, ...slots])]);
  };

  const handleWeeklyScheduleSave = (weeklySchedule: Record<string, Array<{ startTime: string; endTime: string }>>) => {
    console.log('Weekly schedule:', weeklySchedule);
    // Here you would typically save this to the database
    setShowWeeklySelector(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {selectedDate
            ? `Available Times for ${format(selectedDate, 'MMMM d, yyyy')}`
            : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDate && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddTimeRange}>Add Time Range</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Time Ranges</Label>
                <div className="space-y-2">
                  {selectedSlots.length > 0 ? (
                    selectedSlots.map((slot) => (
                      <div key={slot} className="flex items-center gap-2">
                        <span className="text-sm">{slot}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onSlotsChange(selectedSlots.filter(s => s !== slot))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No time slots selected</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWeeklySelector(!showWeeklySelector)}
                  className="w-full"
                >
                  {showWeeklySelector ? "Hide Weekly Schedule" : "Set Weekly Schedule"}
                </Button>

                {showWeeklySelector && (
                  <WeeklyAvailabilitySelector onSave={handleWeeklyScheduleSave} />
                )}
              </div>

              <Button
                onClick={onSave}
                className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Availability"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
