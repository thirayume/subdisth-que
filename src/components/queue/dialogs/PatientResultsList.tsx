
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';

interface PatientResultsListProps {
  matchedPatients: Patient[];
  patientId: string;
  handleSelectPatient: (id: string) => void;
  handleAddNewPatient: () => void;
}

const PatientResultsList: React.FC<PatientResultsListProps> = ({
  matchedPatients,
  patientId,
  handleSelectPatient,
  handleAddNewPatient
}) => {
  if (matchedPatients.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <Label>ผู้ป่วยที่พบ</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleAddNewPatient}
          className="h-8 px-2 text-xs"
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1" />
          เพิ่มผู้ป่วยใหม่
        </Button>
      </div>
      <div className="border rounded-md p-1 bg-muted/30 space-y-1">
        {matchedPatients.map(patient => (
          <div 
            key={patient.id} 
            className={`p-2 rounded-sm cursor-pointer hover:bg-muted flex justify-between ${patientId === patient.id ? 'bg-muted' : ''}`}
            onClick={() => handleSelectPatient(patient.id)}
          >
            <span>{patient.name}</span>
            <span className="text-muted-foreground text-sm">{patient.phone}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientResultsList;
