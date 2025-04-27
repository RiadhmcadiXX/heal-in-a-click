
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SharedPatient } from '@/types';

export function usePatientSharing() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sharePatientWithDoctor = async (
    patientId: string, 
    toDoctorId: string, 
    notes?: string
  ) => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (doctorError) throw doctorError;

      const { data, error } = await supabase
        .from('shared_patients')
        .insert({
          from_doctor_id: doctorData.id,
          to_doctor_id: toDoctorId,
          patient_id: patientId,
          notes: notes || null
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Patient Shared Successfully',
        description: 'The patient details have been shared with the selected doctor.'
      });

      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sharing Patient',
        description: error.message
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSharedPatients = async (): Promise<SharedPatient[]> => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (doctorError) throw doctorError;

      // Modified query: Fetch shared patients and use separate queries for doctor info
      const { data: sharedData, error } = await supabase
        .from('shared_patients')
        .select(`
          *,
          patients (
            first_name,
            last_name
          )
        `)
        .or(`from_doctor_id.eq.${doctorData.id},to_doctor_id.eq.${doctorData.id}`)
        .eq('active', true);

      if (error) throw error;

      // Get all doctor IDs we need to fetch (from_doctor_id)
      const doctorIds = sharedData.map(item => item.from_doctor_id);
      
      // Fetch doctor information in a separate query
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('id, first_name, last_name, profile_image_url')
        .in('id', doctorIds);

      // Create a map of doctor data by ID for easy lookup
      const doctorsMap = {};
      if (doctorsData) {
        doctorsData.forEach(doctor => {
          doctorsMap[doctor.id] = doctor;
        });
      }

      // Process the data to ensure it matches our expected type
      const processedData: SharedPatient[] = (sharedData || []).map((item: any) => ({
        ...item,
        // Merge in the doctor data from our map
        from_doctor: doctorsMap[item.from_doctor_id] || {
          first_name: "Unknown",
          last_name: "Doctor",
          profile_image_url: null
        }
      }));

      return processedData;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Shared Patients',
        description: error.message
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { sharePatientWithDoctor, getSharedPatients, loading };
}
