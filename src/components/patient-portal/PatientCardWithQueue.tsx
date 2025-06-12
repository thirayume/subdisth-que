
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Phone, Calendar, Stethoscope, CheckCircle } from 'lucide-react';
import { Patient, Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';

interface PatientCardWithQueueProps {
  patient: Patient;
  isSelected: boolean;
  onSelect: (patient: Patient) => void;
}

const PatientCardWithQueue: React.FC<PatientCardWithQueueProps> = ({
  patient,
  isSelected,
  onSelect
}) => {
  const [queueInfo, setQueueInfo] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueueInfo = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: queueData, error } = await supabase
          .from('queues')
          .select('*')
          .eq('patient_id', patient.id)
          .in('status', ['WAITING', 'ACTIVE'])
          .eq('queue_date', today)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching queue info:', error);
          return;
        }

        if (queueData && queueData.length > 0) {
          setQueueInfo(queueData[0] as Queue);
        }
      } catch (error) {
        console.error('Error fetching queue info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueInfo();
  }, [patient.id]);

  const getQueueStatusBadge = () => {
    if (loading) return <Badge variant="secondary">กำลังโหลด...</Badge>;
    if (!queueInfo) return <Badge variant="outline">ไม่มีคิว</Badge>;
    
    switch (queueInfo.status) {
      case 'WAITING':
        return <Badge variant="default" className="bg-yellow-500">รอเรียก</Badge>;
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">กำลังรับบริการ</Badge>;
      default:
        return <Badge variant="outline">ไม่มีคิว</Badge>;
    }
  };

  const getQueueTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'GENERAL': 'คิวทั่วไป',
      'APPOINTMENT': 'คิวนัดหมาย',
      'EMERGENCY': 'คิวฉุกเฉิน',
      'PHARMACY': 'คิวยา'
    };
    return typeMap[type] || type;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
      }`}
      onClick={() => onSelect(patient)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            {patient.name}
          </CardTitle>
          {getQueueStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Patient Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{patient.phone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">รหัสผู้ป่วย:</span>
            <span>{patient.patient_id}</span>
          </div>

          {/* Queue Information */}
          {queueInfo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                <Clock className="w-4 h-4" />
                <span>ข้อมูลคิว</span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">หมายเลขคิว:</span>
                  <span className="font-medium">{queueInfo.type}-{String(queueInfo.number).padStart(3, '0')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">ประเภท:</span>
                  <span className="font-medium">{getQueueTypeDisplay(queueInfo.type)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">เวลาสร้าง:</span>
                  <span className="font-medium">
                    {new Date(queueInfo.created_at).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isSelected && (
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="flex-1">
                <Calendar className="w-4 h-4 mr-1" />
                นัดหมาย
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Stethoscope className="w-4 h-4 mr-1" />
                ยา
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCardWithQueue;
