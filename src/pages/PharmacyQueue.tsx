
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QueueList from '@/components/queue/QueueList';

const PharmacyQueue = () => {
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  } = useQueues();
  
  const { patients } = usePatients();
  const { 
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints,
    loading: loadingServicePoints
  } = useServicePointContext();

  // Filter queues for the selected service point
  const servicePointQueues = React.useMemo(() => {
    if (!selectedServicePoint) return [];
    return queues.filter(q => q.service_point_id === selectedServicePoint.id);
  }, [queues, selectedServicePoint]);

  const waitingQueues = servicePointQueues.filter(q => q.status === 'WAITING');
  const activeQueues = servicePointQueues.filter(q => q.status === 'ACTIVE');
  const completedQueues = servicePointQueues.filter(q => q.status === 'COMPLETED');
  const skippedQueues = servicePointQueues.filter(q => q.status === 'SKIPPED');

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่พบข้อมูลผู้ป่วย';
  };

  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      setSelectedServicePoint(servicePoint);
    }
  };

  const handleCallQueue = async (queueId: string) => {
    if (!selectedServicePoint) return null;
    return await callQueue(queueId, selectedServicePoint.id);
  };

  const handleTransferQueue = async (queueId: string) => {
    // This would open a transfer dialog - for now just show a message
    console.log('Transfer queue:', queueId);
  };

  const handleHoldQueue = async (queueId: string) => {
    if (!selectedServicePoint) return null;
    return await putQueueOnHold(queueId, selectedServicePoint.id);
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
            {/* Queue Statistics */}
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{selectedServicePoint.name}</span>
                    <span className="text-sm text-gray-500">({selectedServicePoint.code})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{waitingQueues.length}</p>
                      <p className="text-sm text-gray-500">รอดำเนินการ</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{activeQueues.length}</p>
                      <p className="text-sm text-gray-500">กำลังให้บริการ</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-600">{completedQueues.length}</p>
                      <p className="text-sm text-gray-500">เสร็จสิ้น</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{skippedQueues.length}</p>
                      <p className="text-sm text-gray-500">ข้าม</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Queue Management Tabs */}
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
                    <TabsTrigger value="active" className="relative">
                      กำลังให้บริการ
                      {activeQueues.length > 0 && (
                        <span className="ml-2 rounded-full bg-green-500 text-white text-xs px-2 py-0.5">
                          {activeQueues.length}
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
                    <TabsTrigger value="skipped">
                      ข้าม
                      {skippedQueues.length > 0 && (
                        <span className="ml-2 rounded-full bg-amber-500 text-white text-xs px-2 py-0.5">
                          {skippedQueues.length}
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
                        onUpdateStatus={updateQueueStatus}
                        onCallQueue={handleCallQueue}
                        status="WAITING"
                        selectedServicePoint={selectedServicePoint}
                        servicePoints={servicePoints}
                        showServicePointInfo={false}
                      />
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="active" className="mt-0 h-full">
                    <Card className="h-full overflow-auto border-0 shadow-none">
                      <QueueList
                        queues={activeQueues}
                        getPatientName={getPatientName}
                        onUpdateStatus={updateQueueStatus}
                        onRecallQueue={recallQueue}
                        onTransferQueue={handleTransferQueue}
                        onHoldQueue={handleHoldQueue}
                        status="ACTIVE"
                        selectedServicePoint={selectedServicePoint}
                        servicePoints={servicePoints}
                        showServicePointInfo={false}
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
                      />
                    </Card>
                  </TabsContent>

                  <TabsContent value="skipped" className="mt-0 h-full">
                    <Card className="h-full overflow-auto border-0 shadow-none">
                      <QueueList
                        queues={skippedQueues}
                        getPatientName={getPatientName}
                        onReturnToWaiting={returnSkippedQueueToWaiting}
                        status="SKIPPED"
                        selectedServicePoint={selectedServicePoint}
                        servicePoints={servicePoints}
                        showServicePointInfo={false}
                      />
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PharmacyQueue;
