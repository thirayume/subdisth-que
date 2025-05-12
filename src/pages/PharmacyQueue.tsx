
import React from 'react';
import Layout from '@/components/layout/Layout';
import { usePharmacyQueue } from '@/hooks/usePharmacyQueue';
import { usePatients } from '@/hooks/usePatients';
import { useMedications } from '@/hooks/useMedications';
import { usePatientMedications } from '@/hooks/usePatientMedications';
import NextQueueButton from '@/components/pharmacy/NextQueueButton';
import ActivePharmacyQueue from '@/components/pharmacy/ActivePharmacyQueue';
import PatientMedicationHistory from '@/components/pharmacy/PatientMedicationHistory';
import MedicationDispenseForm from '@/components/pharmacy/MedicationDispenseForm';
import FinishServiceOptions from '@/components/pharmacy/FinishServiceOptions';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PharmacyQueue = () => {
  const { activeQueue, loading, loadingNext, callNextQueue, completeService, forwardService } = usePharmacyQueue();
  const { patients } = usePatients();
  const { medications } = useMedications();
  const { medications: patientMedications, addMedication } = usePatientMedications(
    activeQueue?.patient?.id
  );

  React.useEffect(() => {
    // Fetch medications on mount
    if (medications.length === 0) {
      useMedications().fetchMedications();
    }
  }, [medications.length]);

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">บริการจ่ายยา</h1>
          <Badge variant="outline" className="px-3 py-1">
            {activeQueue ? 'กำลังให้บริการ' : 'รอเรียกคิว'}
          </Badge>
        </div>

        {!activeQueue && (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="text-xl font-medium mb-6">เรียกคิวเข้ารับบริการ</h2>
                <NextQueueButton onCallNext={callNextQueue} loading={loadingNext} />
              </div>
            </CardContent>
          </Card>
        )}

        {activeQueue && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-12">
              <ActivePharmacyQueue queue={activeQueue} />
            </div>

            <div className="md:col-span-5 space-y-6">
              <MedicationDispenseForm 
                patientId={activeQueue.patient?.id} 
                medications={medications}
                onDispenseMedication={addMedication}
              />
              
              <FinishServiceOptions 
                queueId={activeQueue.id} 
                onComplete={completeService}
                onForward={forwardService}
              />
            </div>

            <div className="md:col-span-7">
              <PatientMedicationHistory 
                patientName={activeQueue.patient?.name}
                medications={patientMedications}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PharmacyQueue;
