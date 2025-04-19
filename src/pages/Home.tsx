
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DoctorCard } from "@/components/DoctorCard";
import { SpecialtyFilter } from "@/components/SpecialtyFilter";
import { useDoctors } from "@/hooks/useDoctors";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  
  const { data: doctors = [], isLoading, error } = useDoctors(searchQuery, specialty);
  
  const handleFilterChange = (selectedSpecialty: string) => {
    setSpecialty(selectedSpecialty);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-24 pt-4">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search doctors, specialties, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <SpecialtyFilter onFilterChange={handleFilterChange} />
        
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading doctors...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading doctors. Please try again.</p>
            </div>
          ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No doctors found matching your criteria.</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
