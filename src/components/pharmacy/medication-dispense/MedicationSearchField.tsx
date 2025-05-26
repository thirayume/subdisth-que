
import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Medication } from '@/integrations/supabase/schema';

interface MedicationSearchFieldProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (search: string) => void;
  selectedMedication: Medication | null;
  medications: Medication[];
  onSelectMedication: (medication: Medication) => void;
  isLoading?: boolean;
}

const MedicationSearchField: React.FC<MedicationSearchFieldProps> = ({
  open,
  onOpenChange,
  search,
  onSearchChange,
  selectedMedication,
  medications,
  onSelectMedication,
  isLoading = false
}) => {
  // Ensure medications is always an array and filter safely
  const safeMedications = React.useMemo(() => {
    if (!medications || !Array.isArray(medications)) {
      return [];
    }
    return medications.filter(med => med && typeof med === 'object' && med.id);
  }, [medications]);

  const filteredMedications = React.useMemo(() => {
    if (!search || search.trim() === '') return safeMedications;
    
    const searchLower = search.toLowerCase();
    return safeMedications.filter(med => {
      const name = med.name || '';
      const code = med.code || '';
      return (
        name.toLowerCase().includes(searchLower) ||
        code.toLowerCase().includes(searchLower)
      );
    });
  }, [safeMedications, search]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-2">
        <Label htmlFor="medication">ยา</Label>
        <div className="flex items-center justify-center h-10 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor="medication">ยา</Label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={safeMedications.length === 0}
          >
            {selectedMedication 
              ? selectedMedication.name 
              : safeMedications.length === 0 
                ? "ไม่มีข้อมูลยา" 
                : "ค้นหายา..."
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="ค้นหายา..." 
              onValueChange={onSearchChange} 
              value={search}
              className="h-9"
            />
            <CommandEmpty>ไม่พบยา</CommandEmpty>
            <ScrollArea className="h-64">
              <CommandGroup>
                {filteredMedications.map((med) => (
                  <CommandItem
                    key={med.id}
                    onSelect={() => onSelectMedication(med)}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span>{med.name}</span>
                      <span className="ml-2 text-xs text-gray-400">({med.code})</span>
                    </div>
                    {selectedMedication?.id === med.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MedicationSearchField;
