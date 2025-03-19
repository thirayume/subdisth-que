
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import PatientList from '@/components/patients/PatientList';
import PatientForm from '@/components/patients/PatientForm';
import { toast } from 'sonner';
import { Search, UserPlus, MapPin, RefreshCw } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { Patient } from '@/integrations/supabase/schema';

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

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ข้อมูลผู้ป่วย</h1>
          <p className="text-gray-500">จัดการข้อมูลและประวัติผู้ป่วย</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
            onClick={() => {
              setSelectedPatient(null);
              setShowForm(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            เพิ่มผู้ป่วยใหม่
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">จำนวนผู้ป่วยทั้งหมด</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{patients.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ข้อมูลจากฐานข้อมูล Supabase
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ผู้ป่วยในพื้นที่</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {Math.round((patients.filter(p => p.distance_from_hospital !== undefined && p.distance_from_hospital <= 20).length / (patients.length || 1)) * 100)}%
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ห่างจากโรงพยาบาลไม่เกิน 20 กิโลเมตร
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ผู้ป่วยที่มี LINE ID</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {Math.round((patients.filter(p => p.line_id).length / (patients.length || 1)) * 100)}%
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                สามารถติดต่อผ่าน LINE ได้
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
          <div className="flex">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ค้นหาผู้ป่วย..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>เกิดข้อผิดพลาด: {error}</p>
                </div>
              ) : (
                <PatientList 
                  patients={filteredPatients} 
                  onSelectPatient={handleSelectPatient}
                  onEditPatient={handleEditPatient}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Patients;
