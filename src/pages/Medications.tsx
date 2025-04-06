
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useMedications } from '@/hooks/useMedications';
import { PlusCircle } from 'lucide-react';
import MedicationsSummaryCards from '@/components/medications/MedicationsSummaryCards';
import MedicationsTabs from '@/components/medications/MedicationsTabs';

const Medications = () => {
  const { medications, loading, error, fetchMedications } = useMedications();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ยาและเวชภัณฑ์</h1>
          <p className="text-gray-500">จัดการคลังยาและเวชภัณฑ์</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            เพิ่มรายการยาใหม่
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          <MedicationsSummaryCards medications={medications} />
          <MedicationsTabs 
            medications={medications} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        </>
      )}
    </Layout>
  );
};

export default Medications;
