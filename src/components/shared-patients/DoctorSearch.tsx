
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Share } from "lucide-react";
import { useDoctors } from "@/hooks/useDoctors";
import { Doctor } from "@/types";

interface DoctorSearchProps {
  searchQuery: string;
  selectedPatient: string | null;
  onSearchChange: (query: string) => void;
  onSharePatient: (doctorId: string) => void;
}

export default function DoctorSearch({ 
  searchQuery, 
  selectedPatient,
  onSearchChange,
  onSharePatient 
}: DoctorSearchProps) {
  const { data: doctors, isLoading } = useDoctors(searchQuery);

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Find Doctor</h2>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search doctors by name or specialty..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading doctors...</p>
          ) : doctors && doctors.length > 0 ? (
            <div className="space-y-2">
              {doctors.map((doctor: Doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div>
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                  <Button
                    onClick={() => onSharePatient(doctor.id)}
                    disabled={!selectedPatient}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No doctors found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
