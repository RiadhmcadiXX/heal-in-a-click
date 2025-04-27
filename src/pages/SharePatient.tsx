
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePatientSharing } from '@/hooks/usePatientSharing';
import { useToast } from '@/hooks/use-toast';
import { Doctor, PatientVisit } from '@/types';

export default function SharePatientPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientVisit | null>(null);
  const [sharingNotes, setSharingNotes] = useState('');
  const { sharePatientWithDoctor, loading } = usePatientSharing();
  const { toast } = useToast();

  // Fetch patient from the current doctor's appointments
  const [patients, setPatients] = useState<PatientVisit[]>([]);
  useEffect(() => {
    const fetchPatients = async () => {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', supabase.auth.getUser().data?.user?.id)
        .single();

      if (doctorData) {
        const { data, error } = await supabase
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
          setPatients(data.map(appointment => ({
            ...appointment,
            patients: {
              first_name: appointment.patients?.first_name || '',
              last_name: appointment.patients?.last_name || ''
            }
          })));
        }
      }
    };

    fetchPatients();
  }, []);

  // Search for doctors
  useEffect(() => {
    const searchDoctors = async () => {
      if (searchQuery.length < 2) {
        setDoctors([]);
        return;
      }

      const { data: currentDoctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', supabase.auth.getUser().data?.user?.id)
        .single();

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,specialty.ilike.%${searchQuery}%`
        )
        .neq('id', currentDoctorData?.id);

      if (data) setDoctors(data);
    };

    searchDoctors();
  }, [searchQuery]);

  const handleSharePatient = async () => {
    if (!selectedDoctor || !selectedPatient) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select a doctor and a patient to share.'
      });
      return;
    }

    const result = await sharePatientWithDoctor(
      selectedPatient.patient_id, 
      selectedDoctor.id, 
      sharingNotes
    );

    if (result) {
      // Reset selections
      setSelectedDoctor(null);
      setSelectedPatient(null);
      setSharingNotes('');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Share Patient Details</h1>

      {/* Patient Selection */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Select Patient</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map(patient => (
              <div 
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`
                  border rounded-lg p-3 cursor-pointer 
                  ${selectedPatient?.id === patient.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-100'}
                `}
              >
                {patient.patients.first_name} {patient.patients.last_name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search doctors by name or specialty..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Doctor Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map(doctor => (
          <Card 
            key={doctor.id}
            onClick={() => setSelectedDoctor(doctor)}
            className={`
              cursor-pointer 
              ${selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-100'}
            `}
          >
            <CardContent className="p-4 flex items-center space-x-4">
              <Avatar>
                <AvatarImage 
                  src={doctor.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.id}`} 
                  alt={`${doctor.first_name} ${doctor.last_name}`} 
                />
                <AvatarFallback>
                  {doctor.first_name[0]}{doctor.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{doctor.first_name} {doctor.last_name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                <p className="text-sm text-muted-foreground">{doctor.phone}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sharing Notes */}
      {selectedDoctor && selectedPatient && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Share Patient Details</h2>
            <Textarea 
              placeholder="Add optional notes for the receiving doctor..."
              value={sharingNotes}
              onChange={(e) => setSharingNotes(e.target.value)}
            />
            <Button 
              onClick={handleSharePatient}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sharing...' : `Share ${selectedPatient.patients.first_name} ${selectedPatient.patients.last_name} with ${selectedDoctor.first_name} ${selectedDoctor.last_name}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
