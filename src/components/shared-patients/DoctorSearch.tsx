
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Share, MapPin, Phone } from "lucide-react";
import { useDoctors } from "@/hooks/useDoctors";
import { Doctor } from "@/types";
import { useState } from "react";

interface DoctorSearchProps {
  searchQuery: string;
  selectedPatient: string | null;
  onSearchChange: (query: string) => void;
  onSharePatient: (doctorId: string, notes?: string) => void;
}

export default function DoctorSearch({ 
  searchQuery, 
  selectedPatient,
  onSearchChange,
  onSharePatient 
}: DoctorSearchProps) {
  const { data: doctors, isLoading } = useDoctors(searchQuery);
  const [shareNotes, setShareNotes] = useState<{ [key: string]: string }>({});

  const handleShare = (doctorId: string) => {
    onSharePatient(doctorId, shareNotes[doctorId]);
    setShareNotes(prev => ({ ...prev, [doctorId]: '' }));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Find Doctor</h2>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search doctors by name, specialty or city..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading doctors...</p>
          ) : doctors && doctors.length > 0 && searchQuery ? (
            <div className="space-y-2">
              {doctors.map((doctor: Doctor) => (
                <div key={doctor.id} className="flex flex-col p-4 rounded-md border">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Doctor className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{doctor.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{doctor.phone || 'No phone number'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Add a note for the doctor (optional)"
                    value={shareNotes[doctor.id] || ''}
                    onChange={(e) => setShareNotes(prev => ({
                      ...prev,
                      [doctor.id]: e.target.value
                    }))}
                    className="min-h-[60px] mb-2"
                  />
                  <Button
                    onClick={() => handleShare(doctor.id)}
                    disabled={!selectedPatient}
                    variant="outline"
                    size="sm"
                    className="gap-2 self-end"
                  >
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <p className="text-sm text-muted-foreground">No doctors found</p>
          ) : (
            <p className="text-sm text-muted-foreground">Start typing to search for doctors</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
