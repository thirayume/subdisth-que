import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, RotateCcw, TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';

interface DecisionPointProps {
  phase: number; // 30 or 70
  currentAlgorithm: string;
  currentMetrics: {
    avgWaitTime: number;
    throughput: number;
    completedQueues: number;
  };
  waitingQueues: number;
  onContinue: () => void;
  onChangeAndContinue: (newAlgorithm: string) => void;
}

const DecisionPoint: React.FC<DecisionPointProps> = ({
  phase,
  currentAlgorithm,
  currentMetrics,
  waitingQueues,
  onContinue,
  onChangeAndContinue
}) => {
  const getAlternativeAlgorithm = () => {
    switch (currentAlgorithm) {
      case 'FIFO': return 'PRIORITY';
      case 'PRIORITY': return 'MULTILEVEL';
      case 'MULTILEVEL': return 'FIFO';
      default: return 'PRIORITY';
    }
  };

  const getPerformanceInsights = () => {
    const { avgWaitTime, throughput } = currentMetrics;
    
    if (avgWaitTime > 20) {
      return {
        status: 'warning',
        message: 'เวลารอสูง - ควรพิจารณาเปลี่ยนอัลกอริธึม',
        icon: TrendingUp
      };
    } else if (throughput < 5) {
      return {
        status: 'warning', 
        message: 'ปริมาณงานต่ำ - อาจต้องปรับแต่งกระบวนการ',
        icon: TrendingDown
      };
    } else {
      return {
        status: 'success',
        message: 'ประสิทธิภาพดี - สามารถดำเนินต่อได้',
        icon: TrendingUp
      };
    }
  };

  const alternativeAlgorithm = getAlternativeAlgorithm();
  const insights = getPerformanceInsights();
  const StatusIcon = insights.icon;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Clock className="h-5 w-5" />
          จุดตัดสินใจ {phase}% - วิเคราะห์ประสิทธิภาพปัจจุบัน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เวลารอเฉลี่ย</p>
                <p className="text-2xl font-bold text-blue-600">{currentMetrics.avgWaitTime} นาที</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เสร็จสิ้นแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{currentMetrics.completedQueues}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">คิวคงเหลือ</p>
                <p className="text-2xl font-bold text-orange-600">{waitingQueues}</p>
              </div>
              <Users className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <Alert className={`border-${insights.status === 'warning' ? 'amber' : 'green'}-200 bg-${insights.status === 'warning' ? 'amber' : 'green'}-50`}>
          <StatusIcon className="h-4 w-4" />
          <AlertDescription className={`text-${insights.status === 'warning' ? 'amber' : 'green'}-800`}>
            <strong>ผลการวิเคราะห์:</strong> {insights.message}
          </AlertDescription>
        </Alert>

        {/* Algorithm Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">อัลกอริธึมปัจจุบัน</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">{currentAlgorithm}</Badge>
            <span className="text-sm text-gray-600">
              • {currentAlgorithm === 'FIFO' && 'เข้าก่อน ออกก่อน - เหมาะกับคิวปกติ'}
              {currentAlgorithm === 'PRIORITY' && 'จัดลำดับความสำคัญ - เหมาะกับกรณีเร่งด่วน'}
              {currentAlgorithm === 'MULTILEVEL' && 'หลายระดับ - เหมาะกับคิวหลากหลาย'}
            </span>
          </div>
        </div>

        {/* Decision Options */}
        <div className="space-y-3">
          <h4 className="font-medium">ตัวเลือกการดำเนินการ:</h4>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onContinue}
              variant="default"
              className="flex items-center gap-2 flex-1"
            >
              <ArrowRight className="h-4 w-4" />
              ดำเนินต่อด้วย {currentAlgorithm}
            </Button>
            
            <Button
              onClick={() => onChangeAndContinue(alternativeAlgorithm)}
              variant="outline"
              className="flex items-center gap-2 flex-1"
            >
              <RotateCcw className="h-4 w-4" />
              เปลี่ยนเป็น {alternativeAlgorithm}
            </Button>
          </div>
        </div>

        {/* Algorithm Comparison Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium mb-2">คาดการณ์ผลกระทบ:</h5>
          <div className="text-sm space-y-1">
            <p><strong>หากดำเนินต่อด้วย {currentAlgorithm}:</strong> รักษาความสม่ำเสมอ แต่อาจไม่เหมาะกับสถานการณ์ปัจจุบัน</p>
            <p><strong>หากเปลี่ยนเป็น {alternativeAlgorithm}:</strong> 
              {alternativeAlgorithm === 'PRIORITY' && ' เร่งคิวสำคัญ ลดเวลารอโดยรวม'}
              {alternativeAlgorithm === 'MULTILEVEL' && ' สมดุลระหว่างประเภทคิว ยุติธรรมมากขึ้น'}
              {alternativeAlgorithm === 'FIFO' && ' เน้นความยุติธรรมตามลำดับมาถึง'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DecisionPoint;