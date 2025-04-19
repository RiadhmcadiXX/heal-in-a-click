
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DoctorCard } from "@/components/DoctorCard";
import { SpecialtyFilter } from "@/components/SpecialtyFilter";
import { mockDoctors } from "@/lib/mockData";
import { Doctor } from "@/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  
  // Filter doctors based on search query and specialty
  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = specialty
      ? doctor.specialty === specialty
      : true;
    
    return matchesSearch && matchesSpecialty;
  });
  
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
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
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
