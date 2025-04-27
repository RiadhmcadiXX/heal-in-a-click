
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePatientSharing } from '@/hooks/usePatientSharing';
import { Card } from '@/components/ui/card';
import SharedWithMeTable from '@/components/shared-patients/SharedWithMeTable';
import SharedByMeTable from '@/components/shared-patients/SharedByMeTable';
import PatientSelector from '@/components/shared-patients/PatientSelector';
import DoctorSearch from '@/components/shared-patients/DoctorSearch';
import { PatientVisit } from '@/types';

export default function SharePatientPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientVisit[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const { getSharedPatients, loading } = usePatientSharing();
  const [sharedPatients, setSharedPatients] = useState([]);

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
          .eq('doctor_id', doctorData.id);

        if (data) {
          setPatients(data as PatientVisit[]);
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

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Share Patient Details</h1>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Patients Shared With Me</h2>
          <SharedWithMeTable sharedPatients={sharedPatients} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Patients I've Shared</h2>
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
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>
    </div>
  );
}
