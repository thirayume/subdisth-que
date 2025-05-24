
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, Trash2, Settings } from 'lucide-react';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useQueueSimulation } from '@/hooks/queue/useQueueSimulation';
import QueueManagementContainer from '@/components/queue/management/QueueManagementContainer';
import QueueBoardContainer from '@/components/queue/board/QueueBoardContainer';
import PharmacyQueuePanel from '@/components/test/PharmacyQueuePanel';

const TestDashboard = () => {
  const { servicePoints } = useServicePoints();
  const { simulateQueues, clearTestQueues } = useQueueSimulation();
  
  // Auto-assign first 3 service points for pharmacy panels
  const enabledServicePoints = servicePoints.filter(sp => sp.enabled);
  const [selectedServicePoints, setSelectedServicePoints] = useState<string[]>([]);

  React.useEffect(() => {
    if (enabledServicePoints.length > 0 && selectedServicePoints.length === 0) {
      const autoAssigned = enabledServicePoints.slice(0, 3).map(sp => sp.id);
      setSelectedServicePoints(autoAssigned);
    }
  }, [enabledServicePoints]);

  const handleServicePointChange = (index: number, servicePointId: string) => {
    const updated = [...selectedServicePoints];
    updated[index] = servicePointId;
    setSelectedServicePoints(updated);
  };

  const handleSimulate = async () => {
    await simulateQueues(15);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ระบบทดสอบการจัดการคิว</h1>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSimulate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <PlayCircle className="w-4 h-4" />
              สร้างคิวทดสอบ (15 คิว)
            </Button>
            
            <Button 
              variant="outline"
              onClick={clearTestQueues}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              ลบคิวทดสอบ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Queue Management & Board */}
        <div className="w-1/2 flex flex-col border-r bg-white">
          {/* Queue Management */}
          <div className="h-1/2 border-b overflow-hidden">
            <div className="h-full overflow-auto">
              <QueueManagementContainer />
            </div>
          </div>
          
          {/* Queue Board */}
          <div className="h-1/2 overflow-hidden">
            <div className="h-full overflow-auto">
              <QueueBoardContainer />
            </div>
          </div>
        </div>

        {/* Right Side - Service Point Panels */}
        <div className="w-1/2 flex flex-col">
          {/* Panel Controls */}
          <div className="bg-gray-100 p-4 border-b flex-shrink-0">
            <h3 className="font-medium text-gray-900 mb-3">จุดบริการ</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    จุดบริการ {index + 1}
                  </label>
                  <Select
                    value={selectedServicePoints[index] || ''}
                    onValueChange={(value) => handleServicePointChange(index, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={`เลือก SP${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {enabledServicePoints.map(sp => (
                        <SelectItem key={sp.id} value={sp.id} className="text-xs">
                          {sp.code} - {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Service Point Panels */}
          <div className="flex-1 flex flex-col">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-1/3 border-b last:border-b-0 overflow-hidden">
                {selectedServicePoints[index] ? (
                  <PharmacyQueuePanel 
                    servicePointId={selectedServicePoints[index]}
                    title={`จุดบริการ ${index + 1}`}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">เลือกจุดบริการ</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
