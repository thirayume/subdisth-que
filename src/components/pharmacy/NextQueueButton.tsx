
import React from 'react';
import { Button } from '@/components/ui/button';
import { PhoneOutgoing, Loader2 } from 'lucide-react';

interface NextQueueButtonProps {
  onCallNext: () => Promise<any>;
  loading: boolean;
}

const NextQueueButton: React.FC<NextQueueButtonProps> = ({ onCallNext, loading }) => {
  return (
    <Button
      onClick={onCallNext}
      disabled={loading}
      size="lg"
      className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white min-w-[200px]"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          กำลังเรียกคิว...
        </>
      ) : (
        <>
          <PhoneOutgoing className="h-5 w-5 mr-2" />
          เรียกคิวถัดไป
        </>
      )}
    </Button>
  );
};

export default NextQueueButton;
