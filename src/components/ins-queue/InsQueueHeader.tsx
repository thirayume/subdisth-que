import React from "react";
import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServicePointIns } from "@/integrations/supabase/schema";

interface InsQueueHeaderProps {
  selectedServicePoint: ServicePointIns | null;
  servicePoints: ServicePointIns[];
  onServicePointChange: (value: string) => void;
  onRefresh: () => void;
}

const InsQueueHeader: React.FC<InsQueueHeaderProps> = ({
  selectedServicePoint,
  servicePoints,
  onServicePointChange,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการคิวเข้าตรวจ</h1>
        <p className="text-gray-500 mt-1">จัดการคิวผู้ป่วยที่รอเข้าตรวจ</p>
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto">
        <div className="w-64">
          <Select
            value={selectedServicePoint?.id || ""}
            onValueChange={onServicePointChange}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="เลือกจุดบริการ" />
            </SelectTrigger>
            <SelectContent>
              {servicePoints.map((servicePoint) => (
                <SelectItem key={servicePoint.id} value={servicePoint.id}>
                  {servicePoint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          className="h-10 w-10"
          title="รีเฟรช"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          title="ตั้งค่า"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InsQueueHeader;
