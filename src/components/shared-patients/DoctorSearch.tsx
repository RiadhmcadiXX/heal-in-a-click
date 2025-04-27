
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface DoctorSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DoctorSearch({ searchQuery, onSearchChange }: DoctorSearchProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Find Doctor</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search doctors by name or specialty..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardContent>
    </Card>
  );
}
