
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Queue, Patient } from '@/integrations/supabase/schema';

interface ActiveQueueSectionProps {
  activeQueues: Queue[];
  findPatient: (patientId: string) => Patient | undefined;
}

const ActiveQueueSection: React.FC<ActiveQueueSectionProps> = ({ 
  activeQueues, 
  findPatient 
}) => {
  return (
    <div className="lg:col-span-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">กำลังให้บริการ</h2>
      
      {activeQueues.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-gray-500 text-lg">ไม่มีคิวที่กำลังให้บริการ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeQueues.map(queue => {
            const patient = findPatient(queue.patient_id);
            return (
              <Card key={queue.id} className="bg-white border-2 border-pharmacy-200 shadow-lg animate-pulse-gentle">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-sm font-medium text-pharmacy-700 mb-1">กำลังเรียก</div>
                    <div className="queue-number text-8xl font-bold text-pharmacy-600 mb-4">{queue.number}</div>
                    <div className="text-lg font-medium text-gray-800 mb-1">{patient?.name}</div>
                    <div className="text-sm text-gray-500">ช่องบริการ: 2</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveQueueSection;
