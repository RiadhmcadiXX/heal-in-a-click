
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const specialties = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedist",
  "Neurologist",
  "Psychiatrist",
  "Gynecologist",
  "Ophthalmologist",
  "Dentist"
];

interface SpecialtyFilterProps {
  onFilterChange: (specialty: string) => void;
}

export function SpecialtyFilter({ onFilterChange }: SpecialtyFilterProps) {
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  
  const handleSpecialtyClick = (specialty: string) => {
    setActiveSpecialty(specialty);
    onFilterChange(specialty === "All" ? "" : specialty);
  };
  
  return (
    <ScrollArea className="w-full whitespace-nowrap py-4">
      <div className="flex w-max space-x-2 px-4">
        {specialties.map((specialty) => (
          <Button
            key={specialty}
            onClick={() => handleSpecialtyClick(specialty)}
            variant={activeSpecialty === specialty ? "default" : "outline"}
            className="rounded-full"
          >
            {specialty}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
