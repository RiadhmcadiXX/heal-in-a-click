
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Doctor } from "@/types";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Link to={`/doctor/${doctor.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md mb-4">
        <CardContent className="p-0">
          <div className="flex items-start p-4">
            <div className="flex-shrink-0 mr-4">
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{doctor.name}</h3>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              <p className="text-sm text-gray-500">{doctor.city}</p>
              
              <div className="flex items-center mt-2">
                <div className="flex items-center bg-healthcare-background px-2 py-1 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                </div>
                <div className="ml-2 text-sm">
                  <span className="font-medium text-healthcare-primary">${doctor.consultationFee}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
