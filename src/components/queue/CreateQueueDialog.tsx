
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
import { toast } from 'sonner'; // Added toast for visual feedback

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
      resetState();
    }
  }, [open, resetState]);

  // Add debug logging to see when dialog opens/closes
  React.useEffect(() => {
    console.log(`[CreateQueueDialog] Dialog open state: ${open}`);
    if (open) {
      toast.info("กำลังเปิดหน้าสร้างคิว");
    }
  }, [open]);

  const shouldShowQueueDetails = Boolean(patientId) || (showNewPatientForm && Boolean(newPatientName));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button 
              className="bg-pharmacy-600 hover:bg-pharmacy-700" 
              onClick={() => {
                console.log("Create queue button clicked");
                handleCreateQueue();
              }}
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
          patientLineId={finalPatientLineId}
          purpose={createdPurpose}
        />
      )}
    </>
  );
};

export default CreateQueueDialog;
