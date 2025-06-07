
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Clock, Calendar, X, AlertTriangle, Users } from 'lucide-react';
import { Patient, Queue, QueueStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface PatientSelectionViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onLogout: () => void;
  onClearQueueHistory?: () => void;
}

const PatientSelectionView: React.FC<PatientSelectionViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onLogout,
  onClearQueueHistory
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [patientQueues, setPatientQueues] = useState<Record<string, Queue[]>>({});
  const [loading, setLoading] = useState(true);
  const [cancellingQueue, setCancellingQueue] = useState<string | null>(null);

  const fetchQueuesForPatients = async () => {
    try {
      setLoading(true);
      
      if (patients.length === 0) {
        setLoading(false);
        return;
      }
      
      const patientIds = patients.map(p => p.id);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      const { data: queueData, error } = await supabase
        .from('queues')
        .select('*')
        .in('patient_id', patientIds)
        .in('status', ['WAITING', 'ACTIVE'])
        .eq('queue_date', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group queues by patient ID
      const queuesByPatient: Record<string, Queue[]> = {};
      patientIds.forEach(id => {
        queuesByPatient[id] = [];
      });
      
      if (queueData) {
        queueData.forEach(queue => {
          if (queuesByPatient[queue.patient_id]) {
            queuesByPatient[queue.patient_id].push(queue as Queue);
          }
        });
      }
      
      setPatientQueues(queuesByPatient);
    } catch (error) {
      console.error('Error fetching patient queues:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคิว');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueuesForPatients();
  }, [patients]);

  const handleCancelQueue = async (queueId: string) => {
    try {
      setCancellingQueue(queueId);
      
      const { error } = await supabase
        .from('queues')
        .update({ 
          status: 'CANCELLED' as QueueStatus,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', queueId);
      
      if (error) throw error;
      
      toast.success('ยกเลิกคิวเรียบร้อยแล้ว');
      
      // Refresh queues after cancellation
      await fetchQueuesForPatients();
    } catch (error) {
      console.error('Error cancelling queue:', error);
      toast.error('เกิดข้อผิดพลาดในการยกเลิกคิว');
    } finally {
      setCancellingQueue(null);
    }
  };

  const getQueueTypeLabel = (type: string) => {
    switch (type) {
      case 'PRIORITY':
        return 'ด่วน';
      case 'GENERAL':
        return 'ทั่วไป';
      case 'APPOINTMENT':
        return 'นัดหมาย';
      default:
        return type;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-pharmacy-700`}>
          ระบบติดตามคิวผู้ป่วย
        </h1>
        <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onLogout}>
          ออกจากระบบ
        </Button>
      </div>
      
      <Card className="mb-3 sm:mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            เลือกผู้ป่วย
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <p className="text-center text-gray-500 py-4">ไม่พบข้อมูลผู้ป่วย</p>
          ) : (
            <div className="grid gap-3">
              {patients.map(patient => {
                const queues = patientQueues[patient.id] || [];
                const isSelected = selectedPatient?.id === patient.id;
                
                return (
                  <div key={patient.id} className="space-y-2">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className="w-full justify-between text-left h-auto p-3"
                      onClick={() => onSelectPatient(patient)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{patient.name}</span>
                        {patient.phone && (
                          <span className="text-sm text-gray-500">{patient.phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {loading ? (
                          <span className="text-sm text-gray-400">กำลังโหลด...</span>
                        ) : (
                          <Badge variant={queues.length > 0 ? "default" : "secondary"}>
                            {queues.length} คิว
                          </Badge>
                        )}
                      </div>
                    </Button>
                    
                    {/* Show queues for selected patient */}
                    {isSelected && queues.length > 0 && (
                      <div className="ml-4 space-y-2">
                        {queues.map(queue => {
                          const isPriority = queue.type === 'PRIORITY';
                          
                          return (
                            <Card 
                              key={queue.id} 
                              className={`${
                                isPriority ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                              }`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`text-xl font-bold ${
                                      isPriority ? 'text-red-600' : 'text-pharmacy-600'
                                    }`}>
                                      {formatQueueNumber(queue.type, queue.number)}
                                    </div>
                                    <div className="flex flex-col">
                                      <Badge 
                                        variant={isPriority ? "destructive" : "secondary"}
                                        className="text-xs w-fit"
                                      >
                                        {getQueueTypeLabel(queue.type)}
                                      </Badge>
                                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>สร้างเมื่อ {formatTime(queue.created_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        disabled={cancellingQueue === queue.id}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        ยกเลิก
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                                          ยืนยันการยกเลิกคิว
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          คุณต้องการยกเลิกคิวหมายเลข <strong>{formatQueueNumber(queue.type, queue.number)}</strong> ใช่หรือไม่?
                                          <br />
                                          <span className="text-red-600 font-medium">การยกเลิกนี้ไม่สามารถย้อนกลับได้</span>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleCancelQueue(queue.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          ยืนยันยกเลิกคิว
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                                
                                {queue.notes && (
                                  <div className="mt-2 text-xs text-gray-600">
                                    <span className="font-medium">หมายเหตุ:</span> {queue.notes}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Show message for selected patient with no queues */}
                    {isSelected && queues.length === 0 && !loading && (
                      <div className="ml-4">
                        <Card className="border-gray-200">
                          <CardContent className="p-3 text-center text-gray-500">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">ไม่มีคิวที่รอดำเนินการสำหรับผู้ป่วยรายนี้</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPatient && (
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle>ข้อมูลผู้ป่วยที่เลือก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">ชื่อ:</span> {selectedPatient.name}
              </div>
              {selectedPatient.phone && (
                <div>
                  <span className="font-medium">เบอร์โทร:</span> {selectedPatient.phone}
                </div>
              )}
              {selectedPatient.patient_id && (
                <div>
                  <span className="font-medium">รหัสผู้ป่วย:</span> {selectedPatient.patient_id}
                </div>
              )}
            </div>
            
            <div className="text-center mt-6 space-y-2">
              {onClearQueueHistory && (
                <Button 
                  variant="outline" 
                  onClick={onClearQueueHistory}
                  className={isMobile ? "text-sm w-full" : "w-full"}
                >
                  ล้างประวัติคิวเก่า
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientSelectionView;
