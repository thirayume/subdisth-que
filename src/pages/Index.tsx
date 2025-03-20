
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import QueueList from '@/components/queue/QueueList';
import LineQRCode from '@/components/ui/LineQRCode';
import { Queue, QueueStatus, QueueType, Patient } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  SkipForward, 
  LayoutGrid,
  QrCode,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { queues, loading: loadingQueues, updateQueueStatus, callQueue } = useQueues();
  const { patients, loading: loadingPatients } = usePatients();
  
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>([]);
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [completedQueues, setCompletedQueues] = useState<Queue[]>([]);
  const [skippedQueues, setSkippedQueues] = useState<Queue[]>([]);

  // Update filtered queues when the main queues array changes
  useEffect(() => {
    if (queues) {
      setWaitingQueues(queues.filter(q => q.status === 'WAITING'));
      setActiveQueues(queues.filter(q => q.status === 'ACTIVE'));
      setCompletedQueues(queues.filter(q => q.status === 'COMPLETED'));
      setSkippedQueues(queues.filter(q => q.status === 'SKIPPED'));
    }
  }, [queues]);
  
  // Count queue types
  const generalCount = queues.filter(q => q.type === 'GENERAL' && q.status !== 'COMPLETED').length;
  const priorityCount = queues.filter(q => q.type === 'PRIORITY' && q.status !== 'COMPLETED').length;
  const followUpCount = queues.filter(q => q.type === 'FOLLOW_UP' && q.status !== 'COMPLETED').length;
  const elderlyCount = queues.filter(q => q.type === 'ELDERLY' && q.status !== 'COMPLETED').length;
  
  // Recall queue (announce again)
  const handleRecallQueue = (queueId: string) => {
    const queue = queues.find(q => q.id === queueId);
    if (queue) {
      // Find the patient for this queue
      const patient = patients.find(p => p.id === queue.patient_id);
      if (patient) {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number} - ${patient.name}`);
      } else {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number}`);
      }
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-500">ระบบจัดการคิวห้องยา</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white" asChild>
            <Link to="/queue-board">
              <LayoutGrid className="w-4 h-4 mr-2" />
              หน้าจอแสดงคิว
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Queue summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">คิวที่รอดำเนินการ</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{waitingQueues.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">ทั่วไป: {generalCount}</div>
              <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">ด่วน: {priorityCount}</div>
              <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">ผู้สูงอายุ: {elderlyCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">คิวที่กำลังให้บริการ</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{activeQueues.length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {activeQueues.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium">คิวปัจจุบัน: <span className="text-green-600">#{activeQueues[0].number}</span></div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">เสร็จสิ้นวันนี้</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{completedQueues.length}</h3>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                อัตราการให้บริการเฉลี่ย: <span className="font-medium">12 นาที/คิว</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">นัดหมายวันนี้</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">3</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">ติดตามการใช้ยา: {followUpCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="waiting">
            <TabsList className="mb-4">
              <TabsTrigger value="waiting">รอดำเนินการ ({waitingQueues.length})</TabsTrigger>
              <TabsTrigger value="active">กำลังให้บริการ ({activeQueues.length})</TabsTrigger>
              <TabsTrigger value="completed">เสร็จสิ้น ({completedQueues.length})</TabsTrigger>
              <TabsTrigger value="skipped">ข้ามไปแล้ว ({skippedQueues.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="waiting" className="animate-fade-in">
              <QueueList
                queues={waitingQueues}
                patients={patients}
                title="คิวที่รอดำเนินการ"
                emptyMessage="ไม่มีคิวที่รอดำเนินการ"
                onUpdateStatus={updateQueueStatus}
                onCallQueue={callQueue}
                onRecallQueue={handleRecallQueue}
              />
            </TabsContent>
            
            <TabsContent value="active" className="animate-fade-in">
              <QueueList
                queues={activeQueues}
                patients={patients}
                title="คิวที่กำลังให้บริการ"
                emptyMessage="ไม่มีคิวที่กำลังให้บริการ"
                onUpdateStatus={updateQueueStatus}
                onCallQueue={callQueue}
                onRecallQueue={handleRecallQueue}
              />
            </TabsContent>
            
            <TabsContent value="completed" className="animate-fade-in">
              <QueueList
                queues={completedQueues}
                patients={patients}
                title="คิวที่เสร็จสิ้นแล้ว"
                emptyMessage="ไม่มีคิวที่เสร็จสิ้น"
                onUpdateStatus={updateQueueStatus}
                onCallQueue={callQueue}
                onRecallQueue={handleRecallQueue}
              />
            </TabsContent>
            
            <TabsContent value="skipped" className="animate-fade-in">
              <QueueList
                queues={skippedQueues}
                patients={patients}
                title="คิวที่ถูกข้าม"
                emptyMessage="ไม่มีคิวที่ถูกข้าม"
                onUpdateStatus={updateQueueStatus}
                onCallQueue={callQueue}
                onRecallQueue={handleRecallQueue}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-pharmacy-600" />
                ลงทะเบียนผ่าน LINE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineQRCode queueNumber={999} />
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>สแกนเพื่อเข้าสู่ระบบการจองคิวออนไลน์</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dashboard-card bg-pharmacy-50 border-pharmacy-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-pharmacy-800">สถิติการให้บริการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">เวลาเฉลี่ยต่อคิว</span>
                  <span className="font-semibold">12 นาที</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ผู้รับบริการวันนี้</span>
                  <span className="font-semibold">{completedQueues.length} คน</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">เวลารอเฉลี่ย</span>
                  <span className="font-semibold">25 นาที</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">คิวสูงสุดวันนี้</span>
                  <span className="font-semibold">8</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
