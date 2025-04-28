
import * as React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QueueCreatedDialog from './QueueCreatedDialog';
import PhoneSearchSection from './dialogs/PhoneSearchSection';
import PatientResultsList from './dialogs/PatientResultsList';
import NewPatientForm from './dialogs/NewPatientForm';
import QueueDetailsForm from './dialogs/QueueDetailsForm';
import { useCreateQueue } from './dialogs/hooks/useCreateQueue';
import { toast } from 'sonner'; 

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
      console.log('----------------------------------------');
      console.log('CREATE QUEUE DIALOG OPENED');
      console.log('----------------------------------------');
      toast.info("กำลังเปิดหน้าสร้างคิว");
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
  console.log(`🚨 [CreateQueueDialog] shouldShowQueueDetails: ${shouldShowQueueDetails}`);
  console.log(`- patientId: ${patientId}`);
  console.log(`- showNewPatientForm: ${showNewPatientForm}`);
  console.log(`- newPatientName: ${newPatientName}`);

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
              onClick={() => {
                console.log("🚨 [CreateQueueDialog] Create queue button clicked");
                console.log(`- Patient ID: ${patientId}`);
                console.log(`- New patient name: ${newPatientName}`);
                console.log(`- Show new patient form: ${showNewPatientForm}`);
                console.log(`- Button should be disabled: ${!patientId && !(showNewPatientForm && newPatientName)}`);
                
                // Toast notification for feedback
                toast.loading("กำลังสร้างคิว...");
                
                // Call handle create queue
                handleCreateQueue();
              }}
              disabled={!patientId && !(showNewPatientForm && newPatientName)}
            >
              สร้างคิว
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <QueueCreatedDialog 
        open={qrDialogOpen && createdQueueNumber !== null} 
        onOpenChange={(newState) => {
          console.log(`🚨 [CreateQueueDialog] Updating QR dialog state to: ${newState}`);
          setQrDialogOpen(newState);
        }}
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
