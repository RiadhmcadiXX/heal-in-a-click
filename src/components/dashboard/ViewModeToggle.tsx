
import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  viewMode: "day" | "week";
  setViewMode: (mode: "day" | "week") => void;
}

export function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-md">
      <Button
        variant={viewMode === "day" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("day")}
        className="rounded-l-md rounded-r-none"
      >
        Day View
      </Button>
      <Button
        variant={viewMode === "week" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("week")}
        className="rounded-r-md rounded-l-none"
      >
        Week View
      </Button>
    </div>
  );
}
