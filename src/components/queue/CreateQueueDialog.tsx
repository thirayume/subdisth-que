
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
import { useCreateQueue } from './dialogs/hooks/useCreateQueue';
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
  
  const {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    queueType,
    setQueueType,
    notes,
    setNotes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    queueTypePurposes,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    handleCreateQueue,
    resetState
  } = useCreateQueue(onOpenChange, onCreateQueue);

  // Reset state when dialog is closed
  React.useEffect(() => {
    if (!open) {
      logger.debug('Dialog closed, resetting state');
      resetState();
    } else {
      logger.debug('Dialog opened');
    }
  }, [open, resetState]);
  
  // Add debug logging for QR dialog state
  React.useEffect(() => {
    logger.debug(`QR dialog state changed:`);
    logger.verbose(`- qrDialogOpen: ${qrDialogOpen}`);
    logger.verbose(`- createdQueueNumber: ${createdQueueNumber}`);
    logger.debug(`- QR dialog should show: ${qrDialogOpen && createdQueueNumber !== null}`);
  }, [qrDialogOpen, createdQueueNumber]);

  const shouldShowQueueDetails = Boolean(patientId) || (showNewPatientForm && Boolean(newPatientName));

  const handleSubmit = async () => {
    logger.info('Create queue button clicked');
    logger.debug(`Patient ID: ${patientId}`);
    logger.debug(`New patient form shown: ${showNewPatientForm}`);
    logger.debug(`New patient name: ${newPatientName}`);
    
    if (!patientId && !(showNewPatientForm && newPatientName)) {
      toast.error('โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      return;
    }
    
    await handleCreateQueue();
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
              handleSelectPatient={(id) => handleSelectPatient(id, matchedPatients)}
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
              onClick={handleSubmit}
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
