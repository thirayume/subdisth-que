
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { QueueType, QueueStatus, mockPatients } from '@/lib/mockData';

interface CreateQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQueue: (queue: any) => void;
}

const CreateQueueDialog: React.FC<CreateQueueDialogProps> = ({
  open,
  onOpenChange,
  onCreateQueue,
}) => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [queueType, setQueueType] = useState<QueueType>(QueueType.GENERAL);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateQueue = () => {
    if (!patientId) {
      toast.error('กรุณาเลือกผู้ป่วย');
      return;
    }

    const newQueue = {
      id: uuidv4(),
      number: Math.floor(Math.random() * 100) + 1, // In a real app, this would be generated sequentially
      patientId,
      type: queueType,
      purpose,
      notes,
      status: QueueStatus.WAITING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateQueue(newQueue);
    toast.success(`สร้างคิวหมายเลข ${newQueue.number} เรียบร้อยแล้ว`);
    onOpenChange(false);
    
    // Reset form
    setPatientId('');
    setQueueType(QueueType.GENERAL);
    setPurpose('');
    setNotes('');
    
    // Navigate to the dashboard
    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>สร้างคิวใหม่</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="patient">ผู้ป่วย</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="patient">
                <SelectValue placeholder="เลือกผู้ป่วย" />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="queueType">ประเภทคิว</Label>
            <Select 
              value={queueType} 
              onValueChange={(value) => setQueueType(value as QueueType)}
            >
              <SelectTrigger id="queueType">
                <SelectValue placeholder="เลือกประเภทคิว" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QueueType.GENERAL}>ทั่วไป</SelectItem>
                <SelectItem value={QueueType.PRIORITY}>ด่วน</SelectItem>
                <SelectItem value={QueueType.ELDERLY}>ผู้สูงอายุ</SelectItem>
                <SelectItem value={QueueType.FOLLOW_UP}>ติดตามการรักษา</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="purpose">จุดประสงค์</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="รับยา, ปรึกษาเภสัชกร, ฯลฯ"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button className="bg-pharmacy-600 hover:bg-pharmacy-700" onClick={handleCreateQueue}>
            สร้างคิว
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQueueDialog;
