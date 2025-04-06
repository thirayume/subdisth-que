
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Medication } from '@/integrations/supabase/schema';
import MedicationStatusBadge from './MedicationStatusBadge';

interface MedicationsTableProps {
  medications: Medication[];
  filterText: string;
  filterFunction?: (med: Medication) => boolean;
}

const MedicationsTable: React.FC<MedicationsTableProps> = ({ 
  medications, 
  filterText, 
  filterFunction 
}) => {
  // Apply custom filter function if provided, otherwise use all medications
  const filteredMedications = filterFunction 
    ? medications.filter(filterFunction) 
    : medications.filter(med => 
        med.name.toLowerCase().includes(filterText.toLowerCase()) ||
        med.code.toLowerCase().includes(filterText.toLowerCase())
      );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>รหัสยา</TableHead>
          <TableHead>ชื่อยา</TableHead>
          <TableHead>หน่วย</TableHead>
          <TableHead>คงเหลือ</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead>การจัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMedications.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-6">ไม่พบรายการยาตามที่ค้นหา</TableCell>
          </TableRow>
        ) : (
          filteredMedications.map((med) => (
            <TableRow key={med.id}>
              <TableCell className="font-medium">{med.code}</TableCell>
              <TableCell>{med.name}</TableCell>
              <TableCell>{med.unit}</TableCell>
              <TableCell>{med.stock} {med.unit}</TableCell>
              <TableCell>
                <MedicationStatusBadge stock={med.stock} minStock={med.min_stock} />
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  แก้ไข
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default MedicationsTable;
