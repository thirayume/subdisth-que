
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ServicePoint } from '@/integrations/supabase/schema';

interface PharmacyQueueHeaderProps {
  selectedServicePoint: ServicePoint | null;
  servicePoints: ServicePoint[];
  onServicePointChange: (value: string) => void;
}

const PharmacyQueueHeader: React.FC<PharmacyQueueHeaderProps> = ({
  selectedServicePoint,
  servicePoints,
  onServicePointChange
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold tracking-tight">บริการจ่ายยา</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm mr-2">จุดบริการ:</span>
          <Select 
            value={selectedServicePoint?.id || ''} 
            onValueChange={onServicePointChange}
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
  );
};

export default PharmacyQueueHeader;
