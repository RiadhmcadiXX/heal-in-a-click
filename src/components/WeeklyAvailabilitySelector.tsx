
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek } from "date-fns";

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface WeeklyAvailabilitySelectorProps {
  onSave: (weeklySchedule: Record<string, TimeRange[]>) => void;
}

export function WeeklyAvailabilitySelector({ onSave }: WeeklyAvailabilitySelectorProps) {
  const [selectedDay, setSelectedDay] = React.useState<string>("monday");
  const [timeRanges, setTimeRanges] = React.useState<Record<string, TimeRange[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("17:00");

  const weekDays = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const addTimeRange = () => {
    setTimeRanges((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), { startTime, endTime }],
    }));
  };

  const removeTimeRange = (day: string, index: number) => {
    setTimeRanges((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const startDate = startOfWeek(new Date());
      const slotsToInsert = [];

      for (const [day, ranges] of Object.entries(timeRanges)) {
        const dayIndex = weekDays.findIndex(d => d.value === day);
        if (dayIndex === -1) continue;

        const currentDate = format(addDays(startDate, dayIndex), 'yyyy-MM-dd');

        for (const range of ranges) {
          let start = new Date(`1970-01-01T${range.startTime}`);
          const end = new Date(`1970-01-01T${range.endTime}`);

          while (start < end) {
            slotsToInsert.push({
              available_date: currentDate,
              available_time: format(start, 'HH:mm:00'),
            });
            // Increment by appointment duration (this should come from props)
            start = new Date(start.getTime() + 15 * 60000); // Using 15 minutes as default
          }
        }
      }

      if (slotsToInsert.length > 0) {
        const { error } = await supabase
          .from('doctor_availabilities')
          .insert(slotsToInsert);

        if (error) throw error;
      }

      onSave(timeRanges);
    } catch (error) {
      console.error('Error saving weekly schedule:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Weekly Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label>Day of Week</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Days</SelectLabel>
                    {weekDays.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
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
              <Button onClick={addTimeRange}>Add Time Range</Button>
            </div>
          </div>

          <div className="space-y-4">
            {weekDays.map((day) => (
              <div key={day.value} className="space-y-2">
                <Label>{day.label}</Label>
                {timeRanges[day.value]?.length > 0 ? (
                  <div className="space-y-2">
                    {timeRanges[day.value].map((range, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm">
                          {range.startTime} - {range.endTime}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTimeRange(day.value, index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No time ranges set</p>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Weekly Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
