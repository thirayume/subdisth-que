
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, X, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Medication } from '@/integrations/supabase/schema';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

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
  medications = [], // Default to empty array to prevent undefined
  onDispenseMedication
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dispensedMedications, setDispensedMedications] = useState<DispensedMedication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter medications based on search with safety check
  const filteredMedications = React.useMemo(() => {
    if (!Array.isArray(medications)) {
      console.warn("[MedicationDispenseForm] Medications is not an array:", medications);
      return [];
    }
    
    const searchLower = search.toLowerCase();
    return medications.filter(med => {
      if (!med || !med.name || !med.code) return false;
      return (
        med.name.toLowerCase().includes(searchLower) ||
        med.code.toLowerCase().includes(searchLower)
      );
    });
  }, [medications, search]);

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

  // Show loading state if no medications available
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
          <div className="flex-1 space-y-2">
            <Label htmlFor="medication">ยา</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={medications.length === 0}
                >
                  {selectedMedication ? selectedMedication.name : medications.length === 0 ? "ไม่มีข้อมูลยา" : "ค้นหายา..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="ค้นหายา..." 
                    onValueChange={setSearch} 
                    value={search}
                    className="h-9"
                  />
                  <CommandEmpty>ไม่พบยา</CommandEmpty>
                  <ScrollArea className="h-64">
                    <CommandGroup>
                      {filteredMedications.map((med) => (
                        <CommandItem
                          key={med.id}
                          onSelect={() => handleSelectMedication(med)}
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
          
          <div className="w-full md:w-1/3">
            <Label htmlFor="dosage">ขนาดยา</Label>
            <Input
              id="dosage"
              placeholder="เช่น 1x3 pc"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="instructions">วิธีใช้ / คำแนะนำ</Label>
          <Textarea
            id="instructions"
            placeholder="คำแนะนำในการใช้ยา"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleAddMedication}
            className="bg-green-600 hover:bg-green-700"
            disabled={medications.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" /> เพิ่มยา
          </Button>
        </div>
        
        {dispensedMedications.length > 0 && (
          <>
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">รายการยาที่จ่าย</h3>
              <ul className="space-y-2">
                {dispensedMedications.map((med, index) => (
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
                      onClick={() => handleRemoveMedication(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleSaveDispensing}
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
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationDispenseForm;
