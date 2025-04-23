
import React from "react";
import { Button } from "@/components/ui/button";

interface DayAvailabilitySidebarProps {
  slots: { time: string; status: "free" | "occupied" }[];
  onAddAppointmentClick: () => void;
  onSlotClick?: (slot: string) => void;
}

export function DayAvailabilitySidebar({
  slots,
  onAddAppointmentClick,
  onSlotClick,
}: DayAvailabilitySidebarProps) {
  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4 mb-6 md:mb-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Day's Availability</h3>
        <Button size="sm" variant="default" onClick={onAddAppointmentClick}>
          Add Appointment
        </Button>
      </div>
      <div className="flex flex-col gap-1">
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
    </div>
  );
}

