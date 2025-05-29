
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Medication } from '@/integrations/supabase/schema';

interface MedicationSearchFieldProps {
  medications: Medication[];
  selectedMedication: Medication | null;
  onSelectMedication: (medication: Medication) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MedicationSearchField: React.FC<MedicationSearchFieldProps> = ({
  medications = [],
  selectedMedication,
  onSelectMedication,
  open,
  setOpen
}) => {
  const safeMedications = Array.isArray(medications) ? medications : [];

  const handleMedicationSelect = (medicationName: string) => {
    console.log('Selection triggered with name:', medicationName);
    
    // Find medication by name instead of ID
    const medication = safeMedications.find(med => med.name === medicationName);
    
    if (medication) {
      console.log('Selected medication found:', medication);
      onSelectMedication(medication);
      setOpen(false);
    } else {
      console.error('Medication not found for name:', medicationName);
      console.log('Available medications:', safeMedications.map(m => m.name));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">ยา</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedMedication?.name || "เลือกยา..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {safeMedications.length > 0 ? (
            <Command>
              <CommandInput placeholder="ค้นหายา..." />
              <CommandList>
                <CommandEmpty>ไม่พบยา</CommandEmpty>
                <CommandGroup>
                  {safeMedications.map((medication) => (
                    <CommandItem
                      key={medication.id}
                      value={`${medication.name} ${medication.code}`.toLowerCase()}
                      onSelect={() => handleMedicationSelect(medication.name)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedMedication?.id === medication.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{medication.name}</span>
                        <span className="text-xs text-gray-500">
                          {medication.code} | คงเหลือ: {medication.stock} {medication.unit}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              ไม่มีข้อมูลยา
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MedicationSearchField;
