
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePatientSharing } from '@/hooks/usePatientSharing';
import { useToast } from "@/hooks/use-toast";
import SharedWithMeTable from '@/components/shared-patients/SharedWithMeTable';
import SharedByMeTable from '@/components/shared-patients/SharedByMeTable';
import PatientSelector from '@/components/shared-patients/PatientSelector';
import DoctorSearch from '@/components/shared-patients/DoctorSearch';
import { PatientVisit } from '@/types';
import { MainLayout } from "@/layouts/MainLayout";
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function SharePatient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientVisit[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const { getSharedPatients, sharePatientWithDoctor, loading } = usePatientSharing();
  const [sharedPatients, setSharedPatients] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatients = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userData.user?.id)
        .single();

      if (doctorData) {
        const { data } = await supabase
          .from('appointments')
          .select(`
            id,
            patient_id,
            patients (
              first_name,
              last_name
            )
          `)
          .eq('doctor_id', doctorData.id)
          .not('patient_id', 'is', null);

        if (data) {
          const uniquePatients = data.reduce((acc: PatientVisit[], current: PatientVisit) => {
            const exists = acc.find(item => item.patient_id === current.patient_id);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          setPatients(uniquePatients);
        }
      }
    };

    const fetchSharedPatients = async () => {
      const data = await getSharedPatients();
      setSharedPatients(data);
    };

    fetchPatients();
    fetchSharedPatients();
  }, []);

  const handleSharePatient = async (doctorId: string, notes?: string) => {
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a patient first",
      });
      return;
    }

    await sharePatientWithDoctor(selectedPatient, doctorId, notes);
    const data = await getSharedPatients();
    setSharedPatients(data);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <LoadingAnimation
            animationUrl="https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/images//animation.json"
            width={250}
            height={250}
            className="mx-auto"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">Share Patient Details</h1>

        {/* Tables Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Patients Received From Other Doctors</h2>
            <SharedWithMeTable sharedPatients={sharedPatients} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Patients Shared With Other Doctors</h2>
            <SharedByMeTable sharedPatients={sharedPatients} />
          </div>
        </div>

        {/* Share Patient Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <PatientSelector
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
            />
          </div>
          <div>
            <DoctorSearch
              searchQuery={searchQuery}
              selectedPatient={selectedPatient}
              onSearchChange={setSearchQuery}
              onSharePatient={handleSharePatient}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
