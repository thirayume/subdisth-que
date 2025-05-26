
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
  patientId: string;
  medications: Medication[];
  onDispenseMedication: (data: Omit<PatientMedication, 'id' | 'created_at' | 'updated_at'>) => Promise<PatientMedication | null>;
}

const MedicationDispenseForm: React.FC<MedicationDispenseFormProps> = ({
  patientId,
  medications = [], // Ensure medications is always an array
  onDispenseMedication
}) => {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dispensedMedications, setDispensedMedications] = useState<PatientMedication[]>([]);
  const [isDispensing, setIsDispensing] = useState(false);
  const [open, setOpen] = useState(false);

  // Ensure medications is a valid array
  const safeMedications = Array.isArray(medications) ? medications : [];

  const handleDispense = async () => {
    if (!selectedMedication || !dosage.trim()) {
      toast.error('กรุณาเลือกยาและใส่ขนาดยา');
      return;
    }

    setIsDispensing(true);
    try {
      const medicationData = {
        patient_id: patientId,
        medication_id: selectedMedication.id,
        dosage: dosage.trim(),
        instructions: instructions.trim() || undefined,
        start_date: new Date().toISOString().split('T')[0],
        end_date: undefined,
        notes: undefined
      };

      const result = await onDispenseMedication(medicationData);
      
      if (result) {
        setDispensedMedications(prev => [result, ...prev]);
        setSelectedMedication(null);
        setDosage('');
        setInstructions('');
        toast.success('จ่ายยาเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error('Error dispensing medication:', error);
      toast.error('เกิดข้อผิดพลาดในการจ่ายยา');
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>จ่ายยา</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <MedicationSearchField
            medications={safeMedications}
            selectedMedication={selectedMedication}
            onSelectMedication={setSelectedMedication}
            open={open}
            setOpen={setOpen}
          />

          <DosageField
            value={dosage}
            onChange={setDosage}
            unit={selectedMedication?.unit}
          />

          <InstructionsField
            value={instructions}
            onChange={setInstructions}
          />

          <Button 
            onClick={handleDispense}
            disabled={!selectedMedication || !dosage.trim() || isDispensing}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isDispensing ? 'กำลังจ่ายยา...' : 'จ่ายยา'}
          </Button>
        </div>

        <DispensedMedicationsList 
          medications={dispensedMedications}
          allMedications={safeMedications}
        />
      </CardContent>
    </Card>
  );
};

export default MedicationDispenseForm;
