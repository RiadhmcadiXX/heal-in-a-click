import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface DayAvailabilitySidebarProps {
  slots: {
    time: string;
    status: "free" | "occupied";
  }[];
  onAddAppointmentClick: () => void;
  onSlotClick?: (time: string) => void;
  appointmentDuration?: number;
}

export function DayAvailabilitySidebar({
  slots,
  onAddAppointmentClick,
  onSlotClick,
  appointmentDuration = 60
}: DayAvailabilitySidebarProps) {
  return (
    <Card className="w-full md:w-80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Available Time Slots</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onAddAppointmentClick}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add appointment</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-500 mb-4">
            Each slot is {appointmentDuration} minutes
          </div>
          {slots.length === 0 && (
            <div className="text-muted-foreground text-sm">No slots available.</div>
          )}
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSlotClick && onSlotClick(slot.time)}
              className={`flex items-center justify-between px-3 py-2 rounded transition group ${
                slot.status === "occupied"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
              disabled={slot.status === "occupied"}
              type="button"
            >
              <span className="font-medium">{slot.time}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50 border">
                {slot.status === "occupied" ? "Occupied" : "Free"}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
