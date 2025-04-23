
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useMedications } from '@/hooks/useMedications';
import { PlusCircle, Search } from 'lucide-react';
import MedicationsSummaryCards from '@/components/medications/MedicationsSummaryCards';
import MedicationsTabs from '@/components/medications/MedicationsTabs';
import MedicationsDialog from '@/components/medications/MedicationsDialog';
import { Input } from '@/components/ui/input';
import { Medication } from '@/integrations/supabase/schema';

const Medications = () => {
  // LIFT useMedications to the top level, pass all handlers as props
  const { medications, loading, error, fetchMedications, addMedication, updateMedication } = useMedications();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleCreateMedication = () => {
    setSelectedMedication(null);
    setIsDialogOpen(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ยาและเวชภัณฑ์</h1>
          <p className="text-gray-500">จัดการคลังยาและเวชภัณฑ์</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
            onClick={handleCreateMedication}
          >
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
          <div className="flex mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ค้นหายาและเวชภัณฑ์..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <MedicationsTabs 
            medications={medications} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            onEditMedication={handleEditMedication}
          />
        </>
      )}
      <MedicationsDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        medication={selectedMedication}
        medications={medications}
        addMedication={addMedication}
        updateMedication={updateMedication}
      />
    </Layout>
  );
};

export default Medications;
