
import * as React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; 
import QueueCreatedDialog from './QueueCreatedDialog';
import PhoneSearchSection from './dialogs/PhoneSearchSection';
import PatientResultsList from './dialogs/PatientResultsList';
import NewPatientForm from './dialogs/NewPatientForm';
import QueueDetailsForm from './dialogs/QueueDetailsForm';
import { usePatientQueueInfo } from './dialogs/hooks/queue';
import { useQueueHandler } from './dialogs/hooks/queue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CreateQueueDialog');

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
  logger.verbose(`Rendering with open=${open}`);
  
  // Use the patient queue info hook to manage patient state
  const {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    resetAll: resetPatientState
  } = usePatientQueueInfo();
  
  // Use the queue handler hook to manage queue state
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    handleQueueTypeChange,
    handleNotesChange,
    resetQueueCreation,
    createQueue,
    queueTypePurposes
  } = useQueueHandler();
  
  // State for QR dialog
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = React.useState<number | null>(null);
  const [createdQueueType, setCreatedQueueType] = React.useState(queueType);
  const [createdPurpose, setCreatedPurpose] = React.useState('');

  // Reset state when dialog is closed
  React.useEffect(() => {
    if (!open) {
      logger.debug('Dialog closed, resetting state');
      resetPatientState();
      resetQueueCreation();
      setQrDialogOpen(false);
      setCreatedQueueNumber(null);
    } else {
      logger.debug('Dialog opened');
    }
  }, [open, resetPatientState, resetQueueCreation]);
  
  // Add debug logging for QR dialog state
  React.useEffect(() => {
    logger.debug(`QR dialog state changed:`);
    logger.verbose(`- qrDialogOpen: ${qrDialogOpen}`);
    logger.verbose(`- createdQueueNumber: ${createdQueueNumber}`);
    logger.debug(`- QR dialog should show: ${qrDialogOpen && createdQueueNumber !== null}`);
  }, [qrDialogOpen, createdQueueNumber]);

  const shouldShowQueueDetails = Boolean(patientId) || (showNewPatientForm && Boolean(newPatientName));

  const handleCreateQueue = async () => {
    logger.info('Create queue button clicked');
    logger.debug(`Patient ID: ${patientId}`);
    logger.debug(`New patient form shown: ${showNewPatientForm}`);
    logger.debug(`New patient name: ${newPatientName}`);
    
    if (!patientId && !(showNewPatientForm && newPatientName)) {
      toast.error('โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      return;
    }
    
    try {
      let finalPatientId = patientId;
      
      // If we're creating a new patient
      if (showNewPatientForm) {
        if (!newPatientName) {
          toast.error('กรุณากรอกชื่อผู้ป่วย');
          return;
        }
        
        if (!phoneNumber) {
          toast.error('กรุณากรอกเบอร์โทรศัพท์');
          return;
        }
        
        const newPatient = await handleAddNewPatient();
        if (!newPatient) {
          logger.error('Failed to create patient');
          toast.error('ไม่สามารถสร้างผู้ป่วยใหม่ได้');
          return;
        }
        
        finalPatientId = newPatient.id;
      }
      
      // Create the queue
      logger.debug('Creating queue for patient ID:', finalPatientId);
      const queue = await createQueue(finalPatientId);
      
      if (queue) {
        logger.info('Queue created successfully:', queue);
        toast.success('สร้างคิวสำเร็จ');
        
        // Set the info for the QR dialog
        const queueTypeName = queueTypePurposes[queue.type] || '';
        
        setCreatedQueueNumber(queue.number);
        setCreatedQueueType(queue.type);
        setCreatedPurpose(queueTypeName);
        setQrDialogOpen(true);
        
        // Call the callback
        onCreateQueue(queue);
      } else {
        logger.error('No queue returned from createQueue');
        toast.error('ไม่สามารถสร้างคิวได้');
      }
    } catch (error) {
      logger.error('Error creating queue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว');
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(newOpen) => {
          logger.debug(`Dialog onOpenChange called with: ${newOpen}`);
          onOpenChange(newOpen);
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle>สร้างคิวใหม่</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <PhoneSearchSection 
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              handlePhoneSearch={handlePhoneSearch}
              isSearching={isSearching}
            />

            <PatientResultsList 
              matchedPatients={matchedPatients}
              patientId={patientId}
              handleSelectPatient={handleSelectPatient}
              handleAddNewPatient={handleAddNewPatient}
            />

            <NewPatientForm 
              newPatientName={newPatientName}
              setNewPatientName={setNewPatientName}
              showNewPatientForm={showNewPatientForm}
            />
            
            <QueueDetailsForm 
              queueType={queueType}
              setQueueType={setQueueType}
              notes={notes}
              setNotes={setNotes}
              queueTypePurposes={queueTypePurposes}
              shouldShow={shouldShowQueueDetails}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              logger.debug('Cancel button clicked');
              onOpenChange(false);
            }}>
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
      
      <QueueCreatedDialog 
        open={qrDialogOpen && createdQueueNumber !== null} 
        onOpenChange={setQrDialogOpen}
        queueNumber={createdQueueNumber || 0}
        queueType={createdQueueType || 'GENERAL'}
        patientName={finalPatientName}
        patientPhone={finalPatientPhone}
        patientLineId={finalPatientLineId}
        purpose={createdPurpose}
      />
    </>
  );
};

export default CreateQueueDialog;
