
import * as React from 'react';
import { Medication } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const useUnitOptions = (medications: Medication[] | null | undefined) => {
  const unitOptions = React.useMemo(() => {
    try {
      if (!medications || !Array.isArray(medications)) {
        return [];
      }

      // Get unique units using Set
      const uniqueUnits = new Set(
        medications
          .filter(med => med && typeof med.unit === 'string')
          .map(med => med.unit)
          .filter(unit => unit && unit.length > 0)
      );

      // Convert Set back to sorted array
      return Array.from(uniqueUnits).sort();
    } catch (error) {
      console.error('Error processing medication units:', error);
      return [];
    }
  }, [medications]);

  const handleAddNewUnit = (newUnit: string) => {
    try {
      if (!newUnit || newUnit.trim() === '') {
        toast.error('กรุณาระบุหน่วยยา');
        return;
      }

      if (unitOptions.includes(newUnit.trim())) {
        toast.error('มีหน่วยยานี้อยู่แล้ว');
        return;
      }

      toast.success(`เพิ่มหน่วยยา "${newUnit}" เรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Error adding new unit:', error);
      toast.error('ไม่สามารถเพิ่มหน่วยยาได้');
    }
  };

  return {
    unitOptions,
    handleAddNewUnit
  };
};
