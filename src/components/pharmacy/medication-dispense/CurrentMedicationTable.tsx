
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Save, Plus } from 'lucide-react';
import { Medication } from '@/integrations/supabase/schema';
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
  const [newDosage, setNewDosage] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleAddMedication = () => {
    if (!selectedMedication || !newDosage.trim()) {
      return;
    }

    // Check if medication already exists
    const exists = medications.some(med => med.medication.id === selectedMedication.id);
    if (exists) {
      return;
    }

    const newMedication: CurrentMedication = {
      id: `current-${Date.now()}`,
      medication: selectedMedication,
      dosage: newDosage.trim(),
      instructions: newInstructions.trim()
    };

    onAddMedication(newMedication);
    
    // Reset form
    setSelectedMedication(null);
    setNewDosage('');
    setNewInstructions('');
  };

  const handleDosageChange = (id: string, dosage: string) => {
    onUpdateMedication(id, { dosage });
  };

  const handleInstructionsChange = (id: string, instructions: string) => {
    onUpdateMedication(id, { instructions });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">รายการยาที่จะจ่าย</CardTitle>
          {medications.length > 0 && (
            <Button
              onClick={onSaveAll}
              disabled={isLoading}
              className="bg-pharmacy-600 hover:bg-pharmacy-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'กำลังบันทึก...' : `บันทึกยาทั้งหมด (${medications.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Medication Section */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <h4 className="font-medium text-sm">เพิ่มยาใหม่</h4>
          <div className="grid grid-cols-1 gap-3">
            <MedicationSearchField
              medications={availableMedications}
              selectedMedication={selectedMedication}
              onSelectMedication={setSelectedMedication}
              open={searchOpen}
              setOpen={setSearchOpen}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">ขนาดยา</label>
                <Input
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  placeholder="เช่น 1 เม็ด วันละ 2 ครั้ง"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">คำแนะนำ</label>
                <Input
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="เช่น หลังอาหาร"
                  className="text-sm"
                />
              </div>
            </div>
            <Button
              onClick={handleAddMedication}
              disabled={!selectedMedication || !newDosage.trim()}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              เพิ่มยา
            </Button>
          </div>
        </div>

        {/* Current Medications Table */}
        {medications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">ยังไม่มียาในรายการ</div>
            <div className="text-sm">เพิ่มยาใหม่หรือคัดลอกจากประวัติ</div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>ขนาดยา</TableHead>
                  <TableHead>คำแนะนำ</TableHead>
                  <TableHead className="w-16">ลบ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{med.medication.name}</div>
                        <div className="text-xs text-gray-500">
                          {med.medication.code} | คงเหลือ: {med.medication.stock} {med.medication.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={med.dosage}
                        onChange={(e) => handleDosageChange(med.id, e.target.value)}
                        className="text-sm"
                        placeholder="ขนาดยา"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={med.instructions}
                        onChange={(e) => handleInstructionsChange(med.id, e.target.value)}
                        className="text-sm min-h-[60px]"
                        placeholder="คำแนะนำ"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMedication(med.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentMedicationTable;
