
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Doctor } from "@/types";

export function useDoctors(searchQuery: string = "", specialty: string = "") {
  return useQuery({
    queryKey: ["doctors", searchQuery, specialty],
    queryFn: async () => {
      let query = supabase
        .from("doctors")
        .select(`
          id,
          first_name,
          last_name,
          specialty,
          city,
          consultation_fee,
          experience
        `);

      if (searchQuery) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,` +
          `last_name.ilike.%${searchQuery}%,` +
          `specialty.ilike.%${searchQuery}%,` +
          `city.ilike.%${searchQuery}%`
        );
      }

      if (specialty) {
        query = query.eq("specialty", specialty);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map((doctor: any) => ({
        id: doctor.id,
        name: `${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.specialty,
        city: doctor.city,
        consultationFee: doctor.consultation_fee,
        rating: 4.5, // This would come from reviews in a real implementation
        experience: doctor.experience,
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + doctor.id, // Using DiceBear for placeholder images
        about: `Dr. ${doctor.first_name} ${doctor.last_name} is a highly qualified ${doctor.specialty.toLowerCase()} specialist with ${doctor.experience} years of experience.`
      }));
    },
  });
}
