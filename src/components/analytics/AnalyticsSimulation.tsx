
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Trash2, Clock, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalyticsSimulation } from './hooks/useAnalyticsSimulation';

const AnalyticsSimulation: React.FC = () => {
  const {
    isRunning,
    simulationStats,
    prepareSimulation,
    startTest,
    cleanup,
    loading
  } = useAnalyticsSimulation();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          การจำลองคิวโรงพยาบาลแบบสมจริง
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          จำลองสถานการณ์คิวในโรงพยาบาลจริง พร้อมเวลารอและเวลาให้บริการที่สมจริง
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={prepareSimulation}
            disabled={loading || isRunning}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            เตรียมข้อมูล (Prepare)
          </Button>
          <Button
            onClick={startTest}
            disabled={loading || !simulationStats.prepared}
            variant="default"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'กำลังทดสอบ...' : 'เริ่มทดสอบ (Test)'}
          </Button>
          <Button
            onClick={cleanup}
            disabled={loading}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            ล้างข้อมูล (Cleanup)
          </Button>
        </div>

        {/* Simulation Status */}
        {simulationStats.prepared && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">คิวทั้งหมด</p>
                <p className="text-2xl font-bold text-blue-600">{simulationStats.totalQueues}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">เสร็จสิ้นแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{simulationStats.completedQueues}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-orange-900">เวลารอเฉลี่ย</p>
                <p className="text-2xl font-bold text-orange-600">{simulationStats.avgWaitTime} นาที</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {simulationStats.prepared && (
            <Badge variant="secondary">ข้อมูลพร้อมแล้ว</Badge>
          )}
          {isRunning && (
            <Badge variant="default" className="animate-pulse">กำลังจำลอง</Badge>
          )}
          {simulationStats.completedQueues > 0 && (
            <Badge variant="outline">มีข้อมูลทดสอบ</Badge>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">วิธีการใช้งาน:</h4>
          <ol className="text-sm space-y-1 text-gray-600">
            <li>1. <strong>เตรียมข้อมูล</strong>: สร้างคิวจำลองแบบสมจริง (50-100 คิว)</li>
            <li>2. <strong>เริ่มทดสอบ</strong>: จำลองการทำงานของคิวแบบเรียลไทม์</li>
            <li>3. <strong>ล้างข้อมูล</strong>: ลบข้อมูลทดสอบทั้งหมด</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSimulation;
