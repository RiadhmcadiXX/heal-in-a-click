
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addMinutes, parseISO } from "date-fns";
import { WeeklyAvailabilitySelector } from "./WeeklyAvailabilitySelector";

interface AvailabilityTimeSlotsProps {
  selectedDate: Date | undefined;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  onSave: () => void;
  isSubmitting: boolean;
  timeSlots: Array<{ label: string; value: string }>;
  onWeeklyScheduleSave: (weeklySchedule: Record<string, Array<{ startTime: string; endTime: string }>>) => void;
  appointmentDuration?: number;
}

export function AvailabilityTimeSlots({
  selectedDate,
  selectedSlots,
  onSlotsChange,
  onSave,
  isSubmitting,
  onWeeklyScheduleSave,
  appointmentDuration = 60,
}: AvailabilityTimeSlotsProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [activeTab, setActiveTab] = useState("manual");

  const handleAddTimeRange = () => {
    // Convert the time range into individual slots based on appointment duration
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const slots = [];

    // Create a temporary date to increment
    let current = new Date(start);
    
    // Generate slots based on appointment duration
    while (current < end) {
      slots.push(format(current, 'HH:mm:00'));
      // Add the appointment duration in minutes to the current time
      current = addMinutes(current, appointmentDuration);
    }

    onSlotsChange([...new Set([...selectedSlots, ...slots])]);
  };

  const handleWeeklyScheduleSave = (weeklySchedule: Record<string, Array<{ startTime: string; endTime: string }>>) => {
    onWeeklyScheduleSave(weeklySchedule);
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
            <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Setup</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
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

                <div className="text-sm text-gray-500 mb-2">
                  Slots will be created every {appointmentDuration} minutes
                </div>

                <div className="space-y-2">
                  <Label>Selected Time Ranges</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSlots.length > 0 ? (
                      selectedSlots.map((slot) => (
                        <div key={slot} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <span className="text-sm font-medium">{slot}</span>
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
                      <p className="text-sm text-muted-foreground col-span-2">No time slots selected</p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={onSave}
                  className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Availability"}
                </Button>
              </TabsContent>
              
              <TabsContent value="weekly">
                <WeeklyAvailabilitySelector onSave={handleWeeklyScheduleSave} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
