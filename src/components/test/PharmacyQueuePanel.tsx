
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PharmacyQueueTabs from './pharmacy-queue/PharmacyQueueTabs';

interface PharmacyQueuePanelProps {
  servicePointId?: string;
  title?: string;
  refreshTrigger: number;
}

const PharmacyQueuePanel: React.FC<PharmacyQueuePanelProps> = ({
  servicePointId,
  title = "คิวร้านยา",
  refreshTrigger
}) => {
  if (!servicePointId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <PharmacyQueueTabs
          servicePointId={servicePointId}
          refreshTrigger={refreshTrigger}
        />
      </CardContent>
    </Card>
  );
};

export default PharmacyQueuePanel;
