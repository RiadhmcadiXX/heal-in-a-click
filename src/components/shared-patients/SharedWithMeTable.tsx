
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

interface SharedWithMeTableProps {
  sharedPatients: SharedPatient[];
}

export default function SharedWithMeTable({ sharedPatients }: SharedWithMeTableProps) {
  // Filter to show only patients shared with me (where I'm the to_doctor)
  const filteredPatients = sharedPatients.filter(shared => !shared.from_doctor?.id);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Shared By (Sender)</TableHead>
            <TableHead>Date Received</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No patients have been shared with you yet
              </TableCell>
            </TableRow>
          ) : (
            filteredPatients.map((shared) => (
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
                    Dr. {shared.from_doctor?.first_name || "Unknown"} {shared.from_doctor?.last_name || "Doctor"}
                  </span>
                </TableCell>
                <TableCell>{new Date(shared.shared_at).toLocaleDateString()}</TableCell>
                <TableCell>{shared.notes || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
