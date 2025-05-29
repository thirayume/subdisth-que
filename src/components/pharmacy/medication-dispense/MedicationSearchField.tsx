
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

  console.log('[MedicationSearchField] Component rendered:', {
    medicationsCount: safeMedications.length,
    selectedMedication: selectedMedication?.name,
    isOpen: open
  });

  const handleMedicationSelect = (selectedValue: string) => {
    console.log('[MedicationSearchField] onSelect triggered with value:', selectedValue);
    console.log('[MedicationSearchField] Available medications:', safeMedications.map(m => ({ id: m.id, name: m.name, code: m.code })));
    
    // The selectedValue should be in format "medicationName medicationCode" (lowercase)
    // We need to find the medication by matching the name
    const medication = safeMedications.find(med => {
      const searchValue = `${med.name} ${med.code}`.toLowerCase();
      console.log('[MedicationSearchField] Comparing:', { searchValue, selectedValue, matches: searchValue === selectedValue });
      return searchValue === selectedValue;
    });
    
    if (medication) {
      console.log('[MedicationSearchField] Medication found and selected:', medication);
      onSelectMedication(medication);
      setOpen(false);
    } else {
      console.error('[MedicationSearchField] No medication found for value:', selectedValue);
      // Fallback: try to find by name only
      const fallbackMedication = safeMedications.find(med => 
        med.name.toLowerCase().includes(selectedValue.toLowerCase())
      );
      if (fallbackMedication) {
        console.log('[MedicationSearchField] Fallback medication found:', fallbackMedication);
        onSelectMedication(fallbackMedication);
        setOpen(false);
      }
    }
  };

  const handleItemClick = (medication: Medication, event: React.MouseEvent) => {
    console.log('[MedicationSearchField] Item clicked directly:', medication);
    console.log('[MedicationSearchField] Click event:', event);
    event.preventDefault();
    event.stopPropagation();
    onSelectMedication(medication);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('[MedicationSearchField] Open state changing:', { from: open, to: newOpen });
    setOpen(newOpen);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">ยา</label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => {
              console.log('[MedicationSearchField] Trigger button clicked');
              setOpen(!open);
            }}
          >
            {selectedMedication?.name || "เลือกยา..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
          {safeMedications.length > 0 ? (
            <Command>
              <CommandInput 
                placeholder="ค้นหายา..." 
                onValueChange={(value) => {
                  console.log('[MedicationSearchField] Search input changed:', value);
                }}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="py-4 text-center text-sm text-gray-500">
                    ไม่พบยา
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {safeMedications.map((medication) => {
                    const itemValue = `${medication.name} ${medication.code}`.toLowerCase();
                    console.log('[MedicationSearchField] Rendering item:', { 
                      id: medication.id, 
                      name: medication.name, 
                      code: medication.code,
                      itemValue 
                    });
                    
                    return (
                      <CommandItem
                        key={medication.id}
                        value={itemValue}
                        onSelect={(value) => {
                          console.log('[MedicationSearchField] CommandItem onSelect called with:', value);
                          handleMedicationSelect(value);
                        }}
                        onClick={(event) => handleItemClick(medication, event)}
                        className="cursor-pointer hover:bg-gray-100 px-3 py-2"
                        onMouseEnter={() => {
                          console.log('[MedicationSearchField] Mouse entered item:', medication.name);
                        }}
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
                    );
                  })}
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
