
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { QueueStatus } from '@/integrations/supabase/schema';
import QueueBoardDisplay from '@/components/queue/QueueBoardDisplay';

const QueueBoard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Fetch data from Supabase
  const { getQueuesByStatus } = useQueues();
  const { patients } = usePatients();
  const [activeQueues, setActiveQueues] = useState([]);
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [completedQueues, setCompletedQueues] = useState([]);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch queues data
  useEffect(() => {
    const fetchQueues = async () => {
      const active = await getQueuesByStatus(QueueStatus.ACTIVE);
      setActiveQueues(active);
      
      const waiting = await getQueuesByStatus(QueueStatus.WAITING);
      setWaitingQueues(waiting.sort((a, b) => a.number - b.number).slice(0, 5));
      
      const completed = await getQueuesByStatus(QueueStatus.COMPLETED);
      setCompletedQueues(completed.sort((a, b) => b.number - a.number).slice(0, 5));
    };
    
    fetchQueues();
    
    // Refresh data every 30 seconds
    const refreshTimer = setInterval(fetchQueues, 30000);
    return () => clearInterval(refreshTimer);
  }, [getQueuesByStatus]);
  
  // Format current time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };
  
  // Format current date as Thai format
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Find patient by ID
  const findPatient = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };
  
  return (
    <div className="min-h-screen bg-pharmacy-50">
      {/* Header with time and date */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-pharmacy-800">ระบบแสดงคิวห้องยา</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-pharmacy-700">{formatTime(currentTime)}</div>
                <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="ml-2"
              >
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-pharmacy-600" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Currently serving section */}
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
          
          {/* Waiting queues section */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">คิวถัดไป</h2>
            
            {waitingQueues.length === 0 ? (
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                  <p className="text-gray-500">ไม่มีคิวที่รอดำเนินการ</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {waitingQueues.map((queue, index) => (
                      <div 
                        key={queue.id} 
                        className={`p-4 flex items-center justify-between ${index === 0 ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            index === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {queue.number}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{findPatient(queue.patient_id)?.name}</div>
                            <div className="text-xs text-gray-500">รอประมาณ {5 * (index + 1)} นาที</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Completed queues section */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">คิวที่เสร็จสิ้น</h2>
            
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {completedQueues.length === 0 ? (
                    <div className="p-6 flex items-center justify-center min-h-[200px]">
                      <p className="text-gray-500">ยังไม่มีคิวที่เสร็จสิ้น</p>
                    </div>
                  ) : (
                    completedQueues.map(queue => (
                      <div key={queue.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-3">
                            {queue.number}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{findPatient(queue.patient_id)?.name}</div>
                            <div className="text-xs text-gray-500">เสร็จสิ้นเมื่อ {
                              queue.completed_at && new Date(queue.completed_at).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })
                            }</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Hospital information footer */}
        <footer className="mt-8 p-6 bg-white rounded-lg border border-gray-200 text-center">
          <h3 className="text-xl font-bold text-pharmacy-800 mb-2">โรงพยาบาลชุมชนบ้านเรา</h3>
          <p className="text-gray-600">123 ถนนสุขภาพดี ตำบลสุขใจ อำเภอชุมชน จังหวัดสุขสันต์ 10000</p>
          <p className="text-gray-600 mt-1">โทร. 02-123-4567 | อีเมล: info@hospital.go.th</p>
        </footer>
      </main>
    </div>
  );
};

export default QueueBoard;
