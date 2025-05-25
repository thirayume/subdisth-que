
import React from 'react';
import { ServicePoint } from '@/integrations/supabase/schema';
import PharmacyQueuePanel from '@/components/test/PharmacyQueuePanel';

interface PharmacyQueueContentProps {
  selectedServicePoint: ServicePoint;
  refreshTrigger: number;
}

const PharmacyQueueContent: React.FC<PharmacyQueueContentProps> = ({
  selectedServicePoint,
  refreshTrigger
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      <PharmacyQueuePanel
        key={`pharmacy-${selectedServicePoint.id}`}
        servicePointId={selectedServicePoint.id}
        title={`บริการจ่ายยา - ${selectedServicePoint.name}`}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default PharmacyQueueContent;
