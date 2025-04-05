
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarClock, Clock, TrendingUp, UserCheck, Users } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { QueueAlgorithmType, getOptimalAlgorithmForPharmacy } from '@/utils/queueAlgorithms';

interface QueueAnalyticsProps {
  completedQueues: Queue[];
  waitingQueues: Queue[];
  activeQueues: Queue[];
  skippedQueues: Queue[];
  className?: string;
}

const QueueAnalytics: React.FC<QueueAnalyticsProps> = ({
  completedQueues,
  waitingQueues,
  activeQueues,
  skippedQueues,
  className
}) => {
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  const [waitTimeData, setWaitTimeData] = useState<any[]>([]);
  const [throughputData, setThroughputData] = useState<any[]>([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<QueueAlgorithmType>(
    localStorage.getItem('queue_algorithm') as QueueAlgorithmType || QueueAlgorithmType.FIFO
  );
  
  // Calculate analytics metrics
  useEffect(() => {
    // Generate wait time data
    const generateWaitTimeData = () => {
      const today = new Date();
      const data = [];
      
      // Generate sample data points
      for (let i = 0; i < (timeFrame === 'day' ? 24 : timeFrame === 'week' ? 7 : 30); i++) {
        const date = timeFrame === 'day' 
          ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), i) 
          : subDays(today, i);
        
        // Calculate average wait time from completed queues
        // In a real app, this would use actual historical data
        const waitTime = Math.round(5 + Math.random() * 20); // Random wait time between 5-25 minutes
        
        data.push({
          time: timeFrame === 'day' 
            ? format(date, 'HH:mm', { locale: th })
            : format(date, 'dd MMM', { locale: th }),
          waitTime: waitTime
        });
      }
      
      // Return data in chronological order
      return timeFrame === 'day' ? data : data.reverse();
    };
    
    // Generate throughput data
    const generateThroughputData = () => {
      const today = new Date();
      const data = [];
      
      // Generate sample data points
      for (let i = 0; i < (timeFrame === 'day' ? 24 : timeFrame === 'week' ? 7 : 30); i++) {
        const date = timeFrame === 'day' 
          ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), i) 
          : subDays(today, i);
        
        // Calculate patient count from completed queues
        // In a real app, this would use actual historical data
        const patientCount = Math.round(Math.random() * 15); // Random count between 0-15
        
        data.push({
          time: timeFrame === 'day' 
            ? format(date, 'HH:mm', { locale: th })
            : format(date, 'dd MMM', { locale: th }),
          count: patientCount
        });
      }
      
      // Return data in chronological order
      return timeFrame === 'day' ? data : data.reverse();
    };
    
    setWaitTimeData(generateWaitTimeData());
    setThroughputData(generateThroughputData());
  }, [timeFrame, completedQueues]);
  
  // Calculate metrics
  const totalPatients = completedQueues.length + waitingQueues.length + activeQueues.length;
  const averageWaitTime = completedQueues.length > 0 
    ? completedQueues.reduce((sum, queue) => {
        if (queue.called_at && queue.created_at) {
          const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
          return sum + (waitMs / 60000); // Convert to minutes
        }
        return sum;
      }, 0) / completedQueues.length
    : 0;
    
  const averageServiceTime = completedQueues.length > 0 
    ? completedQueues.reduce((sum, queue) => {
        if (queue.completed_at && queue.called_at) {
          const serviceMs = new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime();
          return sum + (serviceMs / 60000); // Convert to minutes
        }
        return sum;
      }, 0) / completedQueues.length
    : 0;
  
  // Get recommended algorithm based on current queue composition
  const urgentCount = waitingQueues.filter(q => q.type === 'URGENT').length;
  const elderlyCount = waitingQueues.filter(q => q.type === 'ELDERLY').length;
  const recommendedAlgorithm = getOptimalAlgorithmForPharmacy(
    waitingQueues.length,
    urgentCount,
    elderlyCount
  );
  
  // Check if algorithm needs changing
  const shouldChangeAlgorithm = recommendedAlgorithm !== currentAlgorithm;
  
  // Get algorithm name for display
  const getAlgorithmName = (algorithm: QueueAlgorithmType) => {
    switch (algorithm) {
      case QueueAlgorithmType.FIFO: return "First In, First Out (FIFO)";
      case QueueAlgorithmType.PRIORITY: return "ลำดับความสำคัญ (Priority Queue)";
      case QueueAlgorithmType.MULTILEVEL: return "หลายระดับ (Multilevel Queue)";
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK: return "ปรับตามเวลารอ (Feedback Queue)";
      default: return "อัลกอริทึมพื้นฐาน";
    }
  };
  
  const handleChangeAlgorithm = () => {
    setCurrentAlgorithm(recommendedAlgorithm);
    localStorage.setItem('queue_algorithm', recommendedAlgorithm);
    window.location.reload(); // Reload to apply new algorithm
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
            การวิเคราะห์คิว
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-sm bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">คิวที่รอ</p>
                    <h3 className="text-2xl font-bold">{waitingQueues.length}</h3>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">เวลารอเฉลี่ย</p>
                    <h3 className="text-2xl font-bold">{Math.round(averageWaitTime)} นาที</h3>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">เวลาให้บริการเฉลี่ย</p>
                    <h3 className="text-2xl font-bold">{Math.round(averageServiceTime)} นาที</h3>
                  </div>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ผู้รับบริการวันนี้</p>
                    <h3 className="text-2xl font-bold">{completedQueues.length}</h3>
                  </div>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {shouldChangeAlgorithm && (
            <Card className="shadow-sm bg-yellow-50 border-yellow-200 mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-yellow-800">
                    <strong>คำแนะนำ:</strong> อัลกอริทึมปัจจุบัน {getAlgorithmName(currentAlgorithm)} 
                    อาจไม่เหมาะสมกับสถานการณ์ปัจจุบัน
                  </p>
                  <p className="text-sm text-yellow-800">
                    ระบบแนะนำให้ใช้ {getAlgorithmName(recommendedAlgorithm)} เนื่องจากมี
                    {urgentCount > 0 ? ` ${urgentCount} คิวเร่งด่วน ` : ''}
                    {elderlyCount > 0 ? ` ${elderlyCount} คิวผู้สูงอายุ ` : ''}
                    จากทั้งหมด {waitingQueues.length} คิว
                  </p>
                  <button 
                    className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 py-1 px-2 rounded text-sm"
                    onClick={handleChangeAlgorithm}
                  >
                    เปลี่ยนเป็น {getAlgorithmName(recommendedAlgorithm)}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="wait-time" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="wait-time">เวลารอคิว</TabsTrigger>
              <TabsTrigger value="throughput">ปริมาณผู้รับบริการ</TabsTrigger>
              <TabsTrigger value="queue-composition">สัดส่วนประเภทคิว</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wait-time">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger 
                    value="day" 
                    className={timeFrame === 'day' ? 'bg-blue-100' : ''}
                    onClick={() => setTimeFrame('day')}
                  >
                    วันนี้
                  </TabsTrigger>
                  <TabsTrigger 
                    value="week" 
                    className={timeFrame === 'week' ? 'bg-blue-100' : ''}
                    onClick={() => setTimeFrame('week')}
                  >
                    7 วัน
                  </TabsTrigger>
                  <TabsTrigger 
                    value="month" 
                    className={timeFrame === 'month' ? 'bg-blue-100' : ''}
                    onClick={() => setTimeFrame('month')}
                  >
                    30 วัน
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={waitTimeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: timeFrame === 'day' ? 'เวลา' : 'วันที่', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis label={{ value: 'เวลารอ (นาที)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip labelFormatter={(value) => `เวลา: ${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="waitTime" name="เวลารอ (นาที)" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="throughput">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger 
                    value="day" 
                    className={timeFrame === 'day' ? 'bg-blue-100' : ''}
                    onClick={() => setTimeFrame('day')}
                  >
                    วันนี้
                  </TabsTrigger>
                  <TabsTrigger 
                    value="week" 
                    className={timeFrame === 'week' ? 'bg-blue-100' : ''}
                    onClick={() => setTimeFrame('week')}
                  >
                    7 วัน
                  </TabsTrigger>
                  <TabsTrigger 
                    value="month" 
                    className={timeFrame === 'month' ? 'bg-blue-100' : ''}
                    onClick={() => setTimeFrame('month')}
                  >
                    30 วัน
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={throughputData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: timeFrame === 'day' ? 'เวลา' : 'วันที่', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis label={{ value: 'จำนวนผู้รับบริการ', angle: -90, position: 'insideLeft' }} />
                    <Tooltip labelFormatter={(value) => `เวลา: ${value}`} />
                    <Legend />
                    <Bar dataKey="count" name="จำนวนผู้รับบริการ" fill="#10b981" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="queue-composition">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { type: 'ทั่วไป', count: waitingQueues.filter(q => q.type === 'REGULAR').length },
                      { type: 'ผู้สูงอายุ', count: waitingQueues.filter(q => q.type === 'ELDERLY').length },
                      { type: 'เร่งด่วน', count: waitingQueues.filter(q => q.type === 'URGENT').length },
                      { type: 'ยาพิเศษ', count: waitingQueues.filter(q => q.type === 'SPECIAL').length },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" />
                    <Tooltip labelFormatter={(value) => `ประเภท: ${value}`} />
                    <Legend />
                    <Bar dataKey="count" name="จำนวนคิว" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueAnalytics;
