
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Check, ArrowRight } from 'lucide-react';
import QueueForwardDialog from './QueueForwardDialog';

interface FinishServiceOptionsProps {
  queueId: string;
  onComplete: (queueId: string, notes?: string) => Promise<boolean>;
  onForward: (queueId: string, forwardTo: string, notes?: string) => Promise<boolean>;
}

const FinishServiceOptions: React.FC<FinishServiceOptionsProps> = ({
  queueId,
  onComplete,
  onForward
}) => {
  const [notes, setNotes] = useState('');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  
  const handleComplete = async () => {
    const result = await onComplete(queueId, notes);
    if (result) {
      setCompleteDialogOpen(false);
      setNotes('');
    }
    return result;
  };
  
  const handleForward = async (destination: string) => {
    const result = await onForward(queueId, destination, notes);
    if (result) {
      setForwardDialogOpen(false);
      setNotes('');
    }
    return result;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ดำเนินการ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
            <Textarea
              id="notes"
              placeholder="บันทึกข้อมูลเพิ่มเติมเกี่ยวกับการให้บริการ"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => setCompleteDialogOpen(true)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" /> เสร็จสิ้นการให้บริการ
            </Button>
            <Button 
              onClick={() => setForwardDialogOpen(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="h-4 w-4 mr-1" /> ส่งต่อบริการ
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Complete Service Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการเสร็จสิ้นการให้บริการ</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะสิ้นสุดการให้บริการผู้ป่วยรายนี้ และจะไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              ยืนยันเสร็จสิ้น
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Forward Service Dialog */}
      <QueueForwardDialog
        open={forwardDialogOpen}
        onOpenChange={setForwardDialogOpen}
        onForward={handleForward}
      />
    </>
  );
};

export default FinishServiceOptions;
