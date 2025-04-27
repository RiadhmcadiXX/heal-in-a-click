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
      
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userData.user?.id)
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

  const getSharedPatients = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userData.user?.id)
        .single();

      if (doctorError) throw doctorError;

      const { data, error } = await supabase
        .from('shared_patients')
        .select(`
          *,
          patients (
            first_name,
            last_name
          ),
          from_doctor (
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .or(`from_doctor_id.eq.${doctorData.id},to_doctor_id.eq.${doctorData.id}`)
        .eq('active', true);

      if (error) throw error;

      return data as SharedPatient[];
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
