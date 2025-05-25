
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PharmacyQueueTabs from './pharmacy-queue/PharmacyQueueTabs';
import { ServicePoint } from '@/integrations/supabase/schema';

interface PharmacyQueuePanelProps {
  selectedServicePoint: ServicePoint | null;
  refreshTrigger: number;
}

const PharmacyQueuePanel: React.FC<PharmacyQueuePanelProps> = ({
  selectedServicePoint,
  refreshTrigger
}) => {
  if (!selectedServicePoint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>คิวร้านยา</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            กรุณาเลือกจุดบริการ
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>คิวร้านยา - {selectedServicePoint.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <PharmacyQueueTabs
          servicePointId={selectedServicePoint.id}
          refreshTrigger={refreshTrigger}
        />
      </CardContent>
    </Card>
  );
};

export default PharmacyQueuePanel;
