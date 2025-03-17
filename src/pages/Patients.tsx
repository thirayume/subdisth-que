
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import PatientList from '@/components/patients/PatientList';
import PatientForm from '@/components/patients/PatientForm';
import { mockPatients } from '@/lib/mockData';
import { toast } from 'sonner';
import { Search, UserPlus, MapPin, RefreshCw } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleAddPatient = (newPatient: any) => {
    setPatients([...patients, { ...newPatient, id: `P${patients.length + 1000}` }]);
    setShowForm(false);
    toast.success(`เพิ่มข้อมูลผู้ป่วย ${newPatient.name} เรียบร้อยแล้ว`);
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
            onClick={() => setShowForm(true)}
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
                เพิ่มขึ้น <span className="font-medium text-green-600">+5</span> ในเดือนนี้
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ผู้ป่วยในพื้นที่</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">68%</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ห่างจากโรงพยาบาลโดยเฉลี่ย <span className="font-medium">12 กม.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ผู้ป่วยที่มารับบริการซ้ำ</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">45%</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                เปรียบเทียบรายเดือน <span className="font-medium text-green-600">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มข้อมูลผู้ป่วยใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientForm 
              onSubmit={handleAddPatient} 
              onCancel={() => setShowForm(false)}
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
            <CardContent className="p-0">
              <PatientList patients={filteredPatients} />
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Patients;
