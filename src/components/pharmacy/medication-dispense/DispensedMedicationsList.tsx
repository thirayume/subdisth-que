
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, X } from 'lucide-react';
import { Medication } from '@/integrations/supabase/schema';

interface DispensedMedication {
  medication: Medication;
  dosage: string;
  instructions?: string;
}

interface DispensedMedicationsListProps {
  medications: DispensedMedication[];
  onRemoveMedication: (index: number) => void;
  onSaveDispensing: () => void;
  isLoading: boolean;
}

const DispensedMedicationsList: React.FC<DispensedMedicationsListProps> = ({
  medications,
  onRemoveMedication,
  onSaveDispensing,
  isLoading
}) => {
  if (medications.length === 0) {
    return null;
  }

  return (
    <>
      <Separator />
      
      <div>
        <h3 className="font-medium mb-2">รายการยาที่จ่าย</h3>
        <ul className="space-y-2">
          {medications.map((med, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex-1">
                <div className="font-medium">{med.medication.name}</div>
                <div className="text-sm text-gray-600">
                  ขนาดยา: {med.dosage} 
                  {med.instructions && ` | ${med.instructions}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMedication(index)}
                disabled={isLoading}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={onSaveDispensing}
            className="bg-pharmacy-600 hover:bg-pharmacy-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกการจ่ายยา'
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DispensedMedicationsList;
