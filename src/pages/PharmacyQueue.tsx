
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PharmacyQueuePanel from '@/components/test/PharmacyQueuePanel';

const PharmacyQueue = () => {
  const { 
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints,
    loading: loadingServicePoints
  } = useServicePointContext();

  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      setSelectedServicePoint(servicePoint);
    }
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
          <div className="flex-1 overflow-hidden">
            <PharmacyQueuePanel
              key={`pharmacy-${selectedServicePoint.id}`}
              servicePointId={selectedServicePoint.id}
              title="บริการจ่ายยา"
              refreshTrigger={Date.now()}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PharmacyQueue;
