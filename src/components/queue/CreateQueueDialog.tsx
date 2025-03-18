import React, { useState, useEffect } from 'react';
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
import { PlusCircle, Search } from 'lucide-react';
import QueueCreatedDialog from './QueueCreatedDialog';

interface CreateQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQueue: (queue: any) => void;
}

// Define the queue type purpose mapping
const queueTypePurposes = {
  [QueueType.GENERAL]: 'รับยาทั่วไป',
  [QueueType.PRIORITY]: 'กรณีเร่งด่วน',
  [QueueType.ELDERLY]: 'รับยาสำหรับผู้สูงอายุ',
  [QueueType.FOLLOW_UP]: 'ติดตามการรักษา'
};

const CreateQueueDialog: React.FC<CreateQueueDialogProps> = ({
  open,
  onOpenChange,
  onCreateQueue,
}) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPatients, setMatchedPatients] = useState<any[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  
  const [newPatientName, setNewPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [queueType, setQueueType] = useState<QueueType>(QueueType.GENERAL);
  const [notes, setNotes] = useState('');
  
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = useState<number | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = useState('');
  const [createdQueueType, setCreatedQueueType] = useState<QueueType>(QueueType.GENERAL);
  const [createdPurpose, setCreatedPurpose] = useState('');

  useEffect(() => {
    if (!open) {
      setPhoneNumber('');
      setIsSearching(false);
      setMatchedPatients([]);
      setShowNewPatientForm(false);
      setNewPatientName('');
      setPatientId('');
      setQueueType(QueueType.GENERAL);
      setNotes('');
      setSelectedPatientName('');
      setSelectedPatientPhone('');
    }
  }, [open]);

  const handlePhoneSearch = () => {
    if (!phoneNumber) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }

    setIsSearching(true);
    
    const foundPatients = mockPatients.filter(patient => 
      patient.phone && patient.phone.includes(phoneNumber)
    );
    
    setMatchedPatients(foundPatients);
    
    if (foundPatients.length === 0) {
      setShowNewPatientForm(true);
    } else {
      setShowNewPatientForm(false);
    }
    
    setIsSearching(false);
  };

  const handleAddNewPatient = () => {
    setShowNewPatientForm(true);
  };

  const handleSelectPatient = (id: string) => {
    const selectedPatient = mockPatients.find(p => p.id === id);
    setPatientId(id);
    
    if (selectedPatient) {
      setSelectedPatientName(selectedPatient.name);
      setSelectedPatientPhone(selectedPatient.phone || '');
    }
    
    setShowNewPatientForm(false);
  };

  const handleCreateQueue = () => {
    if (!patientId && !newPatientName) {
      toast.error('กรุณาเลือกผู้ป่วยหรือกรอกชื่อผู้ป่วยใหม่');
      return;
    }

    let selectedPatientId = patientId;
    let finalPatientName = selectedPatientName;
    let finalPatientPhone = selectedPatientPhone;

    if (showNewPatientForm && newPatientName) {
      const newPatient = {
        id: uuidv4(),
        name: newPatientName,
        phone: phoneNumber,
        gender: '',
        birthDate: '',
        address: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockPatients.push(newPatient);
      selectedPatientId = newPatient.id;
      finalPatientName = newPatientName;
      finalPatientPhone = phoneNumber;
      
      toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${newPatientName}`);
    }

    const purpose = queueTypePurposes[queueType];
    
    const queueNumber = Math.floor(Math.random() * 100) + 1;
    
    const newQueue = {
      id: uuidv4(),
      number: queueNumber,
      patientId: selectedPatientId,
      type: queueType,
      purpose: purpose,
      notes,
      status: QueueStatus.WAITING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateQueue(newQueue);
    toast.success(`สร้างคิวหมายเลข ${queueNumber} เรียบร้อยแล้ว`);
    
    setCreatedQueueNumber(queueNumber);
    setCreatedQueueType(queueType);
    setCreatedPurpose(purpose);
    setQrDialogOpen(true);
    
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>สร้างคิวใหม่</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
              <div className="flex gap-2">
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  disabled={isSearching}
                />
                <Button 
                  variant="outline" 
                  onClick={handlePhoneSearch}
                  disabled={isSearching}
                  className="px-3"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {matchedPatients.length > 0 && (
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>ผู้ป่วยที่พบ</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAddNewPatient}
                    className="h-8 px-2 text-xs"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    เพิ่มผู้ป่วยใหม่
                  </Button>
                </div>
                <div className="border rounded-md p-1 bg-muted/30 space-y-1">
                  {matchedPatients.map(patient => (
                    <div 
                      key={patient.id} 
                      className={`p-2 rounded-sm cursor-pointer hover:bg-muted flex justify-between ${patientId === patient.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelectPatient(patient.id)}
                    >
                      <span>{patient.name}</span>
                      <span className="text-muted-foreground text-sm">{patient.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showNewPatientForm && (
              <div className="grid gap-2">
                <Label htmlFor="newPatientName">ชื่อ-นามสกุล (ผู้ป่วยใหม่)</Label>
                <Input
                  id="newPatientName"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="กรอกชื่อ-นามสกุลผู้ป่วยใหม่"
                />
              </div>
            )}
            
            {(patientId || (showNewPatientForm && newPatientName)) && (
              <>
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
                      <SelectItem value={QueueType.GENERAL}>ทั่วไป - {queueTypePurposes[QueueType.GENERAL]}</SelectItem>
                      <SelectItem value={QueueType.PRIORITY}>ด่วน - {queueTypePurposes[QueueType.PRIORITY]}</SelectItem>
                      <SelectItem value={QueueType.ELDERLY}>ผู้สูงอายุ - {queueTypePurposes[QueueType.ELDERLY]}</SelectItem>
                      <SelectItem value={QueueType.FOLLOW_UP}>ติดตามการรักษา - {queueTypePurposes[QueueType.FOLLOW_UP]}</SelectItem>
                    </SelectContent>
                  </Select>
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
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button 
              className="bg-pharmacy-600 hover:bg-pharmacy-700" 
              onClick={handleCreateQueue}
              disabled={!patientId && !(showNewPatientForm && newPatientName)}
            >
              สร้างคิว
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {createdQueueNumber !== null && (
        <QueueCreatedDialog 
          open={qrDialogOpen} 
          onOpenChange={setQrDialogOpen} 
          queueNumber={createdQueueNumber}
          queueType={createdQueueType}
          patientName={finalPatientName}
          patientPhone={finalPatientPhone}
          purpose={createdPurpose}
        />
      )}
    </>
  );
};

export default CreateQueueDialog;
