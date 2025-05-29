
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Save, Plus } from 'lucide-react';
import { Medication } from '@/integrations/supabase/schema';
import { toast } from 'sonner';
import MedicationSearchField from './MedicationSearchField';

export interface CurrentMedication {
  id: string;
  medication: Medication;
  dosage: string;
  instructions: string;
}

interface CurrentMedicationTableProps {
  medications: CurrentMedication[];
  availableMedications: Medication[];
  onAddMedication: (medication: CurrentMedication) => void;
  onUpdateMedication: (id: string, updates: Partial<CurrentMedication>) => void;
  onRemoveMedication: (id: string) => void;
  onSaveAll: () => void;
  isLoading: boolean;
}

const CurrentMedicationTable: React.FC<CurrentMedicationTableProps> = ({
  medications,
  availableMedications,
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
  onSaveAll,
  isLoading
}) => {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [open, setOpen] = useState(false);

  const handleAddMedication = () => {
    if (!selectedMedication || !dosage.trim()) {
      toast.error('กรุณาเลือกยาและใส่ขนาดยา');
      return;
    }

    const newMedication: CurrentMedication = {
      id: `new-${Date.now()}`,
      medication: selectedMedication,
      dosage: dosage.trim(),
      instructions: instructions.trim()
    };

    onAddMedication(newMedication);
    
    // Clear form
    setSelectedMedication(null);
    setDosage('');
    setInstructions('');
  };

  const handleDosageChange = (id: string, newDosage: string) => {
    if (newDosage.trim()) {
      onUpdateMedication(id, { dosage: newDosage.trim() });
    }
  };

  const handleInstructionsChange = (id: string, newInstructions: string) => {
    onUpdateMedication(id, { instructions: newInstructions });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">รายการยาที่จะจ่าย</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Add New Medication Form */}
        <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium">เพิ่มยาใหม่</h4>
          
          <MedicationSearchField
            medications={availableMedications}
            selectedMedication={selectedMedication}
            onSelectMedication={setSelectedMedication}
            open={open}
            setOpen={setOpen}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">ขนาดยา</label>
              <Input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="เช่น 500mg, 2 เม็ด"
                className="text-sm"
              />
              {selectedMedication && (
                <div className="text-xs text-gray-500 mt-1">
                  หน่วย: {selectedMedication.unit}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">คำแนะนำ</label>
              <Input
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="เช่น กินหลังอาหาร"
                className="text-sm"
              />
            </div>
          </div>

          <Button 
            onClick={handleAddMedication}
            disabled={!selectedMedication || !dosage.trim()}
            size="sm"
            className="w-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            เพิ่มยา
          </Button>
        </div>

        {/* Current Medications List */}
        <div className="flex-1 overflow-auto border rounded-lg">
          {medications.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <div className="mb-2">ยังไม่มียาในรายการ</div>
                <div className="text-sm">เพิ่มยาจากฟอร์มด้านบน หรือคัดลอกจากประวัติ</div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>ขนาดยา</TableHead>
                  <TableHead>คำแนะนำ</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{med.medication.name}</div>
                        <div className="text-xs text-gray-500">
                          {med.medication.code} | คงเหลือ: {med.medication.stock} {med.medication.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={med.dosage}
                        onChange={(e) => handleDosageChange(med.id, e.target.value)}
                        className="text-sm h-8"
                        placeholder="ขนาดยา"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={med.instructions}
                        onChange={(e) => handleInstructionsChange(med.id, e.target.value)}
                        className="text-sm min-h-[32px] h-8 resize-none"
                        placeholder="คำแนะนำ"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMedication(med.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Save All Button */}
        {medications.length > 0 && (
          <Button 
            onClick={onSaveAll}
            disabled={isLoading}
            className="w-full bg-pharmacy-600 hover:bg-pharmacy-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'กำลังจ่ายยา...' : `จ่ายยาทั้งหมด (${medications.length} รายการ)`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentMedicationTable;
