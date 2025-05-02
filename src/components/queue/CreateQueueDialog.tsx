
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
  console.log(`🚨 [CreateQueueDialog] Rendering with open=${open}`);
  
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
      console.log('🚨 [CreateQueueDialog] Dialog closed, resetting state');
      resetState();
    } else {
      console.log('🚨 [CreateQueueDialog] Dialog opened');
    }
  }, [open, resetState]);
  
  // Add debug logging for QR dialog state
  React.useEffect(() => {
    console.log(`🚨 [CreateQueueDialog] QR dialog state changed:`);
    console.log(`- qrDialogOpen: ${qrDialogOpen}`);
    console.log(`- createdQueueNumber: ${createdQueueNumber}`);
    console.log(`- QR dialog should show: ${qrDialogOpen && createdQueueNumber !== null}`);
  }, [qrDialogOpen, createdQueueNumber]);

  const shouldShowQueueDetails = Boolean(patientId) || (showNewPatientForm && Boolean(newPatientName));

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(newOpen) => {
          console.log(`🚨 [CreateQueueDialog] Dialog onOpenChange called with: ${newOpen}`);
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
              console.log('🚨 [CreateQueueDialog] Cancel button clicked');
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
