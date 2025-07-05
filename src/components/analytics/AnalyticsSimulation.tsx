
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Trash2, Clock, Users, Activity, AlertTriangle, Database, BarChart3 } from 'lucide-react';
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
          {simulationStats.isSimulationMode && (
            <Badge variant="outline" className="border-orange-300 bg-orange-100 text-orange-700">
              🔬 Active
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          จำลองสถานการณ์คิวในโรงพยาบาลจริง พร้อมเวลารอและเวลาให้บริการที่สมจริง ครอบคลุมทุกประเภทคิว
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={prepareSimulation}
            disabled={loading || isRunning}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            เตรียมข้อมูล (ล้างทั้งหมด + จำลองใหม่)
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
            ล้างข้อมูลทั้งหมด (กลับสู่ข้อมูลจริง)
          </Button>
        </div>

        {/* Simulation Status */}
        {simulationStats.prepared && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">คิวจำลองทั้งหมด</p>
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

            {/* Queue Type Distribution */}
            {Object.keys(simulationStats.queueTypeDistribution).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-700">การกระจายตัวของประเภทคิว</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(simulationStats.queueTypeDistribution).map(([type, count]) => (
                    <div key={type} className="text-center p-2 bg-white rounded border">
                      <div className="text-lg font-bold text-gray-800">{count}</div>
                      <div className="text-xs text-gray-600">{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {simulationStats.prepared && (
            <Badge variant="secondary">ข้อมูลจำลองพร้อมแล้ว</Badge>
          )}
          {isRunning && (
            <Badge variant="default" className="animate-pulse">กำลังจำลอง</Badge>
          )}
          {simulationStats.isSimulationMode && (
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              🔬 โหมดจำลอง
            </Badge>
          )}
          {simulationStats.completedQueues > 0 && (
            <Badge variant="outline">มีข้อมูลทดสอบ</Badge>
          )}
        </div>

        {/* Enhanced Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            วิธีการใช้งาน (ปรับปรุงใหม่):
          </h4>
          <ol className="text-sm space-y-1 text-gray-600">
            <li>1. <strong>เตรียมข้อมูล</strong>: ล้างข้อมูลคิววันนี้ทั้งหมด + สร้างข้อมูลจำลองสมจริง (75-100 คิว) ครอบคลุมทุกประเภทคิว</li>
            <li>2. <strong>เริ่มทดสอบ</strong>: จำลองการทำงานของคิวแบบเรียลไทม์ (30 วินาที) พร้อมอัพเดทกราห</li>
            <li>3. <strong>เปรียบเทียบอัลกอริธึม</strong>: ใช้ปุ่มเปรียบเทียบเพื่อดูผลกระทบก่อนเปลี่ยนอัลกอริธึม</li>
            <li>4. <strong>ล้างข้อมูลทั้งหมด</strong>: ลบข้อมูลจำลองและกลับสู่โหมดข้อมูลจริง</li>
          </ol>
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <strong>หมายเหตุ:</strong> การเตรียมข้อมูลจะใช้ประเภทคิวทั้งหมดที่เปิดใช้งาน และกระจายให้เท่าๆ กัน
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSimulation;
