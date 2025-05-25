
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Medication } from '@/integrations/supabase/schema';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { toast } from 'sonner';
import {
  MedicationSearchField,
  DosageField,
  InstructionsField,
  DispensedMedicationsList
} from './medication-dispense';

interface MedicationDispenseFormProps {
  patientId?: string;
  medications: Medication[];
  onDispenseMedication: (data: Omit<PatientMedication, 'id' | 'created_at' | 'updated_at'>) => Promise<PatientMedication | null>;
}

interface DispensedMedication {
  medication: Medication;
  dosage: string;
  instructions?: string;
}

const MedicationDispenseForm: React.FC<MedicationDispenseFormProps> = ({
  patientId,
  medications = [],
  onDispenseMedication
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dispensedMedications, setDispensedMedications] = useState<DispensedMedication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setSearch('');
    setOpen(false);
  };

  const handleAddMedication = () => {
    if (!selectedMedication) {
      toast.error('กรุณาเลือกยา');
      return;
    }
    
    if (!dosage) {
      toast.error('กรุณาระบุขนาดยา');
      return;
    }
    
    setDispensedMedications(prev => [
      ...prev, 
      { 
        medication: selectedMedication, 
        dosage, 
        instructions 
      }
    ]);
    
    // Reset form
    setSelectedMedication(null);
    setDosage('');
    setInstructions('');
  };

  const handleRemoveMedication = (index: number) => {
    setDispensedMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDispensing = async () => {
    if (!patientId) {
      toast.error('ไม่พบข้อมูลผู้ป่วย');
      return;
    }
    
    if (dispensedMedications.length === 0) {
      toast.error('กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ');
      return;
    }
    
    setIsLoading(true);
    let success = true;
    
    try {
      // Save all dispensed medications
      for (const med of dispensedMedications) {
        const result = await onDispenseMedication({
          patient_id: patientId,
          medication_id: med.medication.id,
          dosage: med.dosage,
          instructions: med.instructions,
          start_date: new Date().toISOString()
        });
        
        if (!result) {
          success = false;
        }
      }
      
      if (success) {
        toast.success(`บันทึกการจ่ายยาจำนวน ${dispensedMedications.length} รายการเรียบร้อยแล้ว`);
        setDispensedMedications([]);
      }
    } catch (error) {
      console.error('Error dispensing medications:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกการจ่ายยา');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if medications are not available
  if (!Array.isArray(medications)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">จ่ายยา</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลดข้อมูลยา...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">จ่ายยา</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <MedicationSearchField
            open={open}
            onOpenChange={setOpen}
            search={search}
            onSearchChange={setSearch}
            selectedMedication={selectedMedication}
            medications={medications}
            onSelectMedication={handleSelectMedication}
            isLoading={medications.length === 0}
          />
          
          <DosageField
            value={dosage}
            onChange={setDosage}
          />
        </div>
        
        <InstructionsField
          value={instructions}
          onChange={setInstructions}
        />
        
        <div className="flex justify-end">
          <Button 
            onClick={handleAddMedication}
            className="bg-green-600 hover:bg-green-700"
            disabled={medications.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" /> เพิ่มยา
          </Button>
        </div>
        
        <DispensedMedicationsList
          medications={dispensedMedications}
          onRemoveMedication={handleRemoveMedication}
          onSaveDispensing={handleSaveDispensing}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default MedicationDispenseForm;
