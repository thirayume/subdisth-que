
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePharmacyQueue } from '@/hooks/usePharmacyQueue';
import { useMedications } from '@/hooks/useMedications';
import { usePatientMedications } from '@/hooks/usePatientMedications';
import NextQueueButton from '@/components/pharmacy/NextQueueButton';
import ActivePharmacyQueue from '@/components/pharmacy/ActivePharmacyQueue';
import MedicationDispenseForm from '@/components/pharmacy/MedicationDispenseForm';
import FinishServiceOptions from '@/components/pharmacy/FinishServiceOptions';
import PatientMedicationHistory from '@/components/pharmacy/PatientMedicationHistory';
import QueueList from '@/components/queue/QueueList';

const PharmacyQueue = () => {
  const { 
    queues,
    activeQueue,
    loading,
    loadingNext,
    error,
    callNextQueue,
    completeService,
    forwardService
  } = usePharmacyQueue();
  
  const { medications } = useMedications();
  const { 
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints,
    loading: loadingServicePoints
  } = useServicePointContext();

  // Initialize patient medications hook with active queue's patient
  const {
    medications: patientMedications,
    loading: loadingPatientMeds,
    addMedication: dispenseMedication
  } = usePatientMedications(activeQueue?.patient_id);

  // Filter queues by status
  const waitingQueues = queues.filter(q => q.status === 'WAITING');
  const completedQueues = queues.filter(q => q.status === 'COMPLETED');

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    const queue = queues.find(q => q.patient_id === patientId);
    return queue?.patient ? queue.patient.name : 'ไม่พบข้อมูลผู้ป่วย';
  };

  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      setSelectedServicePoint(servicePoint);
    }
  };

  const handleCallNextQueue = async () => {
    if (!selectedServicePoint) return;
    await callNextQueue(selectedServicePoint.id);
  };

  const handleCompleteService = async (queueId: string, notes?: string) => {
    return await completeService(queueId, notes);
  };

  const handleForwardService = async (queueId: string, forwardTo: string, notes?: string) => {
    return await forwardService(queueId, forwardTo, notes);
  };

  if (loadingServicePoints) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">กำลังโหลดข้อมูลจุดบริการ...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="overflow-hidden">
      <div className="flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">บริการจ่ายยา</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-sm mr-2">จุดบริการ:</span>
              <Select 
                value={selectedServicePoint?.id || ''} 
                onValueChange={handleServicePointChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="เลือกจุดบริการ" />
                </SelectTrigger>
                <SelectContent>
                  {servicePoints
                    .filter(sp => sp.enabled)
                    .map(sp => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.code} - {sp.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <Badge variant="outline" className="px-3 py-1">
              {selectedServicePoint ? selectedServicePoint.name : 'เลือกจุดบริการ'}
            </Badge>
          </div>
        </div>

        {!selectedServicePoint ? (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="text-xl font-medium mb-4">เลือกจุดบริการ</h2>
                <p className="text-gray-500">กรุณาเลือกจุดบริการเพื่อดูคิวที่ได้รับมอบหมาย</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Queue Statistics and Call Next Button */}
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{selectedServicePoint.name}</span>
                      <span className="text-sm text-gray-500">({selectedServicePoint.code})</span>
                    </div>
                    <NextQueueButton
                      onCallNext={handleCallNextQueue}
                      isLoading={loadingNext}
                      disabled={!!activeQueue}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{waitingQueues.length}</p>
                      <p className="text-sm text-gray-500">รอดำเนินการ</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{activeQueue ? 1 : 0}</p>
                      <p className="text-sm text-gray-500">กำลังให้บริการ</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-600">{completedQueues.length}</p>
                      <p className="text-sm text-gray-500">เสร็จสิ้น</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Queue Service Interface */}
            {activeQueue ? (
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Active Queue and Medication Dispensing */}
                  <div className="space-y-6">
                    <ActivePharmacyQueue 
                      queue={activeQueue} 
                      servicePoint={selectedServicePoint}
                    />
                    
                    <MedicationDispenseForm
                      patientId={activeQueue.patient_id}
                      medications={medications}
                      onDispenseMedication={dispenseMedication}
                    />
                    
                    <FinishServiceOptions
                      queueId={activeQueue.id}
                      onComplete={handleCompleteService}
                      onForward={handleForwardService}
                    />
                  </div>
                  
                  {/* Right Column - Patient Medication History */}
                  <div>
                    <PatientMedicationHistory
                      patientName={activeQueue.patient?.name}
                      medications={patientMedications}
                      loading={loadingPatientMeds}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Queue Management Tabs */
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="waiting" className="h-full flex flex-col">
                  <div className="border-b px-2">
                    <TabsList className="h-12">
                      <TabsTrigger value="waiting" className="relative">
                        คิวที่รอดำเนินการ
                        {waitingQueues.length > 0 && (
                          <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                            {waitingQueues.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        เสร็จสิ้น
                        {completedQueues.length > 0 && (
                          <span className="ml-2 rounded-full bg-gray-500 text-white text-xs px-2 py-0.5">
                            {completedQueues.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <TabsContent value="waiting" className="mt-0 h-full">
                      <Card className="h-full overflow-auto border-0 shadow-none">
                        <QueueList
                          queues={waitingQueues}
                          getPatientName={getPatientName}
                          status="WAITING"
                          selectedServicePoint={selectedServicePoint}
                          servicePoints={servicePoints}
                          showServicePointInfo={false}
                          showActions={false}
                        />
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="completed" className="mt-0 h-full">
                      <Card className="h-full overflow-auto border-0 shadow-none">
                        <QueueList
                          queues={completedQueues}
                          getPatientName={getPatientName}
                          status="COMPLETED"
                          selectedServicePoint={selectedServicePoint}
                          servicePoints={servicePoints}
                          showServicePointInfo={false}
                          showActions={false}
                        />
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PharmacyQueue;
