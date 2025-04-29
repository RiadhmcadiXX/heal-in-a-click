
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SharedPatient } from '@/types';
import { usePatientSharing } from '@/hooks/usePatientSharing';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function SharedPatientsTable() {
  const { getSharedPatients, loading } = usePatientSharing();
  const [sharedPatients, setSharedPatients] = useState<SharedPatient[]>([]);

  useEffect(() => {
    const fetchSharedPatients = async () => {
      const data = await getSharedPatients();
      setSharedPatients(data);
    };

    fetchSharedPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingAnimation
          animationUrl="https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/images//animation.json"
          width={150}
          height={150}
        />
      </div>
    );
  }

  if (sharedPatients.length === 0) {
    return <div className="text-center p-4 text-gray-500">No shared patients found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Shared By/With</TableHead>
            <TableHead>Date Shared</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sharedPatients.map((shared) => (
            <TableRow key={shared.id}>
              <TableCell>
                {shared.patients?.first_name || "Unknown"} {shared.patients?.last_name || "Patient"}
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={shared.from_doctor?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shared.from_doctor_id}`} 
                    alt={`${shared.from_doctor?.first_name || "Unknown"} ${shared.from_doctor?.last_name || "Doctor"}`} 
                  />
                  <AvatarFallback>
                    {(shared.from_doctor?.first_name?.[0] || "U")}{(shared.from_doctor?.last_name?.[0] || "D")}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {shared.from_doctor?.first_name || "Unknown"} {shared.from_doctor?.last_name || "Doctor"}
                </span>
              </TableCell>
              <TableCell>{new Date(shared.shared_at).toLocaleDateString()}</TableCell>
              <TableCell>{shared.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
