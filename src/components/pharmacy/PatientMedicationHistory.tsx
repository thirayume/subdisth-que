
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { PatientMedication } from '@/hooks/usePatientMedications';
import { formatThaiDate } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientMedicationHistoryProps {
  patientName?: string;
  medications: PatientMedication[];
  loading: boolean;
}

const PatientMedicationHistory: React.FC<PatientMedicationHistoryProps> = ({
  patientName,
  medications,
  loading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          ประวัติการรับยาของ {patientName || 'ผู้ป่วย'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ไม่พบประวัติการรับยา
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>ขนาดยา</TableHead>
                  <TableHead>คำแนะนำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatThaiDate(med.start_date)}
                    </TableCell>
                    <TableCell>{med.medication?.name || 'ไม่ระบุ'}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell className="max-w-[250px] break-words">{med.instructions || '-'}</TableCell>
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

export default PatientMedicationHistory;
