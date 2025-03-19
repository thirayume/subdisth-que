
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { QueueType, QueueStatus } from '@/integrations/supabase/schema';
import { PlusCircle, Search } from 'lucide-react';
import QueueCreatedDialog from './QueueCreatedDialog';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';

interface CreateQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQueue: (queue: any) => void;
}

// Define the queue type purpose mapping
const queueTypePurposes = {
  'GENERAL': 'รับยาทั่วไป',
  'PRIORITY': 'กรณีเร่งด่วน',
  'ELDERLY': 'รับยาสำหรับผู้สูงอายุ',
  'FOLLOW_UP': 'ติดตามการรักษา'
};

const CreateQueueDialog: React.FC<CreateQueueDialogProps> = ({
  open,
  onOpenChange,
  onCreateQueue,
}) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPatients, setMatchedPatients] = useState<Patient[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  
  const [newPatientName, setNewPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [queueType, setQueueType] = useState<QueueType>('GENERAL');
  const [notes, setNotes] = useState('');
  
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = useState<number | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = useState('');
  const [createdQueueType, setCreatedQueueType] = useState<QueueType>('GENERAL');
  const [createdPurpose, setCreatedPurpose] = useState('');
  // Added these two state variables to track final patient info
  const [finalPatientName, setFinalPatientName] = useState('');
  const [finalPatientPhone, setFinalPatientPhone] = useState('');

  useEffect(() => {
    if (!open) {
      setPhoneNumber('');
      setIsSearching(false);
      setMatchedPatients([]);
      setShowNewPatientForm(false);
      setNewPatientName('');
      setPatientId('');
      setQueueType('GENERAL');
      setNotes('');
      setSelectedPatientName('');
      setSelectedPatientPhone('');
      setFinalPatientName('');
      setFinalPatientPhone('');
    }
  }, [open]);

  const handlePhoneSearch = async () => {
    if (!phoneNumber) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('phone', `%${phoneNumber}%`);
        
      if (error) {
        throw error;
      }
      
      setMatchedPatients(data || []);
      
      if (data.length === 0) {
        setShowNewPatientForm(true);
      } else {
        setShowNewPatientForm(false);
      }
    } catch (err: any) {
      console.error('Error searching for patients:', err);
      toast.error('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddNewPatient = () => {
    setShowNewPatientForm(true);
  };

  const handleSelectPatient = (id: string) => {
    const selectedPatient = matchedPatients.find(p => p.id === id);
    setPatientId(id);
    
    if (selectedPatient) {
      setSelectedPatientName(selectedPatient.name);
      setSelectedPatientPhone(selectedPatient.phone || '');
    }
    
    setShowNewPatientForm(false);
  };

  const handleCreateQueue = async () => {
    if (!patientId && !newPatientName) {
      toast.error('กรุณาเลือกผู้ป่วยหรือกรอกชื่อผู้ป่วยใหม่');
      return;
    }

    let selectedPatientId = patientId;
    let patientNameToUse = selectedPatientName;
    let patientPhoneToUse = selectedPatientPhone;

    if (showNewPatientForm && newPatientName) {
      try {
        // Generate a patient_id with format P + 4 digits
        const patientIdNum = Math.floor(1000 + Math.random() * 9000);
        const patient_id = `P${patientIdNum}`;
        
        const { data: newPatientData, error } = await supabase
          .from('patients')
          .insert([{
            name: newPatientName,
            phone: phoneNumber,
            patient_id: patient_id,
          }])
          .select();
        
        if (error) {
          throw error;
        }
        
        if (newPatientData && newPatientData.length > 0) {
          selectedPatientId = newPatientData[0].id;
          patientNameToUse = newPatientName;
          patientPhoneToUse = phoneNumber;
          
          toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${newPatientName}`);
        }
      } catch (err) {
        console.error('Error creating new patient:', err);
        toast.error('ไม่สามารถสร้างข้อมูลผู้ป่วยใหม่ได้');
        return;
      }
    }

    // Set the final patient information
    setFinalPatientName(patientNameToUse);
    setFinalPatientPhone(patientPhoneToUse);

    const purpose = queueTypePurposes[queueType];
    
    const queueNumber = Math.floor(Math.random() * 100) + 1;
    
    try {
      const { data, error } = await supabase
        .from('queues')
        .insert([{
          number: queueNumber,
          patient_id: selectedPatientId,
          type: queueType,
          status: 'WAITING' as QueueStatus,
          notes: notes
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        onCreateQueue(data[0]);
        toast.success(`สร้างคิวหมายเลข ${queueNumber} เรียบร้อยแล้ว`);
        
        setCreatedQueueNumber(queueNumber);
        setCreatedQueueType(queueType);
        setCreatedPurpose(purpose);
        setQrDialogOpen(true);
        
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Error creating queue:', err);
      toast.error('ไม่สามารถสร้างคิวได้');
    }
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
                      <SelectItem value="GENERAL">ทั่วไป - {queueTypePurposes['GENERAL']}</SelectItem>
                      <SelectItem value="PRIORITY">ด่วน - {queueTypePurposes['PRIORITY']}</SelectItem>
                      <SelectItem value="ELDERLY">ผู้สูงอายุ - {queueTypePurposes['ELDERLY']}</SelectItem>
                      <SelectItem value="FOLLOW_UP">ติดตามการรักษา - {queueTypePurposes['FOLLOW_UP']}</SelectItem>
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
