
import React from 'react';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check } from 'lucide-react';

interface QueueCreatedHeaderProps {
  purpose?: string;
}

const QueueCreatedHeader: React.FC<QueueCreatedHeaderProps> = ({ purpose }) => {
  return (
    <DialogHeader className="space-y-3">
      <DialogTitle className="text-center flex items-center justify-center gap-2">
        <Check className="h-5 w-5 text-green-500" />
        <span>สร้างคิวเรียบร้อยแล้ว</span>
      </DialogTitle>
      {purpose && (
        <DialogDescription className="text-center text-sm">
          {purpose}
        </DialogDescription>
      )}
    </DialogHeader>
  );
};

export default QueueCreatedHeader;
