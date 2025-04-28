
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { WeeklyAvailabilitySelector } from "./WeeklyAvailabilitySelector";

interface AvailabilityTimeSlotsProps {
  selectedDate: Date | undefined;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  onSave: () => void;
  isSubmitting: boolean;
  timeSlots: Array<{ label: string; value: string }>;
  onWeeklyScheduleSave: (weeklySchedule: Record<string, Array<{ startTime: string; endTime: string }>>) => void;
}

export function AvailabilityTimeSlots({
  selectedDate,
  selectedSlots,
  onSlotsChange,
  onSave,
  isSubmitting,
  onWeeklyScheduleSave,
}: AvailabilityTimeSlotsProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [activeTab, setActiveTab] = useState("manual");

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
