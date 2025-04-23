
import React from 'react';
import MedicationsDialogHeader from './MedicationsDialogHeader';
import MedicationsDialogForm from './MedicationsDialogForm';
import { Medication } from '@/integrations/supabase/schema';

interface MedicationsDialogControllerProps {
  medications: Medication[];
  medication: Medication | null;
  isEditing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addMedication: (data: any) => Promise<any>;
  updateMedication: (id: string, data: any) => Promise<any>;
}

const MedicationsDialogController: React.FC<MedicationsDialogControllerProps> = ({
  medications,
  medication,
  isEditing,
  open,
  onOpenChange,
  addMedication,
  updateMedication,
}) => {
  console.log("MedicationsDialogController rendered with open:", open, "isEditing:", isEditing);
  
  const handleSubmit = async (values: any) => {
    try {
      console.log("Submitting medication form with values:", values);
      if (isEditing && medication) {
        await updateMedication(medication.id, values);
      } else {
        await addMedication(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  return (
    <>
      <MedicationsDialogHeader isEditing={isEditing} />
      <MedicationsDialogForm
        medication={medication}
        medications={medications} 
        isEditing={isEditing}
        open={open}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </>
  );
};

export default MedicationsDialogController;
