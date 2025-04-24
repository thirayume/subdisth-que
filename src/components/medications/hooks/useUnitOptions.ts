
import * as React from 'react';
import { Medication } from '@/integrations/supabase/schema';

export const useUnitOptions = (medications: Medication[]) => {
  const [newUnitInput, setNewUnitInput] = React.useState('');
  const [openUnitPopover, setOpenUnitPopover] = React.useState(false);
  
  // Ensure medications is always an array
  const safeMedications = Array.isArray(medications) ? medications : [];
  
  const unitOptions = React.useMemo(() => {
    const nonEmptyUnits = safeMedications
      .map(med => med && med.unit)
      .filter(unit => typeof unit === 'string' && unit.length > 0);
    const units = new Set(nonEmptyUnits);
    return Array.from(units).map(unit => ({
      value: unit,
      label: unit
    }));
  }, [safeMedications]);

  const handleAddNewUnit = (setValue: (value: string) => void) => {
    if (newUnitInput.trim() !== '') {
      setValue(newUnitInput.trim());
      setOpenUnitPopover(false);
      setNewUnitInput('');
    }
  };

  return {
    newUnitInput,
    setNewUnitInput,
    openUnitPopover,
    setOpenUnitPopover,
    unitOptions,
    handleAddNewUnit
  };
};
