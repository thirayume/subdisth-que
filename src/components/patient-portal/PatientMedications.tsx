
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientMedicationsProps {
  patientId: string;
}

interface PatientMedication {
  id: string;
  medication_id: string;
  patient_id: string;
  dosage: string;
  instructions: string;
  start_date: string;
  end_date?: string;
  medication: {
    name: string;
    description: string;
    unit: string;
  };
}

const PatientMedications: React.FC<PatientMedicationsProps> = ({ patientId }) => {
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        
        // For now, we'll mock this data since we don't have a patient_medications table yet
        // In a real implementation, we would fetch from a patient_medications table
        
        // Fetch all medications for now
        const { data, error } = await supabase
          .from('medications')
          .select('*')
          .limit(5);
        
        if (error) throw error;
        
        if (data) {
          // Mock some patient medications data
          const mockPatientMeds = data.map((med, index) => ({
            id: `mock-${index}`,
            medication_id: med.id,
            patient_id: patientId,
            dosage: index % 2 === 0 ? '1 เม็ด วันละ 3 ครั้ง หลังอาหาร' : '1 เม็ด วันละ 2 ครั้ง ก่อนอาหาร',
            instructions: 'รับประทานต่อเนื่อง',
            start_date: new Date().toISOString(),
            end_date: index % 3 === 0 ? undefined : new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            medication: {
              name: med.name,
              description: med.description || '',
              unit: med.unit
            }
          }));
          
          setMedications(mockPatientMeds);
        }
      } catch (error) {
        console.error('Error fetching medications:', error);
        toast.error('ไม่สามารถดึงข้อมูลยาได้');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedications();
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-pharmacy-600" />
            รายการยา
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (medications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-pharmacy-600" />
            รายการยา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Info className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600">ไม่พบข้อมูลยาสำหรับผู้ป่วยรายนี้</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-pharmacy-600" />
          รายการยา
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map((med) => (
            <div 
              key={med.id} 
              className="p-4 rounded-md border border-gray-200 hover:border-pharmacy-200 hover:bg-pharmacy-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-pharmacy-700">{med.medication.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{med.dosage}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-pharmacy-100 text-pharmacy-700">
                    {med.medication.unit}
                  </span>
                </div>
              </div>
              
              {med.medication.description && (
                <p className="text-sm text-gray-500 mt-2">{med.medication.description}</p>
              )}
              
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>เริ่ม: {new Date(med.start_date).toLocaleDateString('th-TH')}</span>
                {med.end_date && (
                  <span>สิ้นสุด: {new Date(med.end_date).toLocaleDateString('th-TH')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientMedications;
