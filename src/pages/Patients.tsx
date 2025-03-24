
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import PatientForm from '@/components/patients/PatientForm';
import { usePatients } from '@/hooks/usePatients';
import { Patient } from '@/integrations/supabase/schema';
import PatientHeader from '@/components/patients/PatientHeader';
import PatientStats from '@/components/patients/PatientStats';
import PatientSearch from '@/components/patients/PatientSearch';
import PatientListContainer from '@/components/patients/PatientListContainer';

const Patients = () => {
  const { 
    patients, 
    loading, 
    error, 
    addPatient, 
    updatePatient,
    searchPatients 
  } = usePatients();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const performSearch = async () => {
        const results = await searchPatients(searchTerm);
        setFilteredPatients(results);
      };
      
      performSearch();
    }
  }, [searchTerm, patients, searchPatients]);

  const handleAddPatient = async (newPatient: Partial<Patient>) => {
    const result = await addPatient(newPatient);
    if (result) {
      setShowForm(false);
    }
  };
  
  const handleUpdatePatient = async (updatedPatient: Partial<Patient>) => {
    if (selectedPatient) {
      const result = await updatePatient(selectedPatient.id, updatedPatient);
      if (result) {
        setShowForm(false);
        setSelectedPatient(null);
      }
    }
  };
  
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    // Navigate to patient detail or show detail modal
  };
  
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleSubmitPatient = (patientData: Partial<Patient>) => {
    if (selectedPatient) {
      handleUpdatePatient(patientData);
    } else {
      handleAddPatient(patientData);
    }
  };

  const handleAddNewPatient = () => {
    setSelectedPatient(null);
    setShowForm(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <Layout>
      <PatientHeader onAddPatient={handleAddNewPatient} />
      
      <PatientStats patients={patients} />
      
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPatient ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มข้อมูลผู้ป่วยใหม่'}</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientForm 
              patient={selectedPatient || undefined}
              onSubmit={handleSubmitPatient} 
              onCancel={() => {
                setShowForm(false);
                setSelectedPatient(null);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <PatientSearch 
            searchTerm={searchTerm} 
            onSearchChange={handleSearchChange} 
          />
          
          <PatientListContainer 
            patients={filteredPatients}
            loading={loading}
            error={error}
            onSelectPatient={handleSelectPatient}
            onEditPatient={handleEditPatient}
          />
        </div>
      )}
    </Layout>
  );
};

export default Patients;
