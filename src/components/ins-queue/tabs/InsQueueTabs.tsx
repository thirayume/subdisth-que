import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import InsQueueTabContent from "./components/InsQueueTabContent";
import { QueueIns } from "@/integrations/supabase/schema";
import { useInsQueueData } from "./useInsQueueData";
import InsQueueTransferDialog from "./InsQueueTransferDialog";

interface InsQueueTabsProps {
  servicePointId?: string;
  refreshTrigger: number;
}

const InsQueueTabs: React.FC<InsQueueTabsProps> = ({
  servicePointId = "",
  refreshTrigger,
}) => {
  // Add state for current tab value
  const [currentTab, setCurrentTab] = React.useState<string>("waiting");
  const {
    queuesByStatus,
    getIdCard,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue,
    selectedServicePoint,
    servicePoints,
  } = useInsQueueData({
    servicePointId: servicePointId || "",
    refreshTrigger,
  });

  // Patient info dialog state (placeholder for future implementation)
  const [patientInfoOpen, setPatientInfoOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<any | null>(
    null
  );

  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferQueueId, setTransferQueueId] = React.useState<string | null>(
    null
  );

  const handleViewPatientInfo = (queue: QueueIns, _type_tab: string) => {
    // For future implementation - could show ID card details
    console.log("View patient info for ID card:", queue.ID_card);
  };

  const handleTransferClick = (queueId: string) => {
    setTransferQueueId(queueId);
    setTransferDialogOpen(true);
  };

  const handleConfirmTransfer = async (targetServicePointId: string) => {
    if (!transferQueueId) return;
    await handleTransferQueue(transferQueueId, targetServicePointId);
    setTransferDialogOpen(false);
    setTransferQueueId(null);
  };

  console.log("queuesByStatus", queuesByStatus);

  return (
    <div className="h-full">
      <Tabs
        defaultValue="waiting"
        className="h-full flex flex-col"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            รอดำเนินการ
            {queuesByStatus.waiting.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.waiting.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            กำลังให้บริการ
            {queuesByStatus.active.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.active.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paused" className="flex items-center gap-2">
            พัก
            {queuesByStatus.paused.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.paused.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="skipped" className="flex items-center gap-2">
            ข้าม
            {queuesByStatus.skipped.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.skipped.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            เสร็จสิ้น
            {queuesByStatus.completed.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queuesByStatus.completed.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <InsQueueTabContent
            value="waiting"
            queues={queuesByStatus.waiting}
            emptyMessage="ไม่มีคิวที่รอดำเนินการ"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onUpdateStatus={handleUpdateStatus}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
          />

          <InsQueueTabContent
            value="active"
            queues={queuesByStatus.active}
            emptyMessage="ไม่มีคิวที่กำลังให้บริการ"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onUpdateStatus={handleUpdateStatus}
            onRecallQueue={handleRecallQueue}
            onHoldQueue={handleHoldQueue}
            onTransferClick={handleTransferClick}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
          />

          <InsQueueTabContent
            value="paused"
            queues={queuesByStatus.paused}
            emptyMessage="ไม่มีคิวที่พัก"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onCallQueue={handleCallQueue}
            onReturnToWaiting={handleReturnToWaiting}
            onUpdateStatus={handleUpdateStatus}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
          />

          <InsQueueTabContent
            value="skipped"
            queues={queuesByStatus.skipped}
            emptyMessage="ไม่มีคิวที่ถูกข้าม"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            onReturnToWaiting={handleReturnToWaiting}
            onCancelQueue={handleCancelQueue}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
          />

          <InsQueueTabContent
            value="completed"
            queues={queuesByStatus.completed}
            emptyMessage="ไม่มีคิวที่เสร็จสิ้น"
            getIdCard={getIdCard}
            onViewPatientInfo={handleViewPatientInfo}
            isCompleted={true}
            onTabChange={setCurrentTab}
            servicePoints={servicePoints}
          />
        </div>
      </Tabs>
      <InsQueueTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransfer={handleConfirmTransfer}
        servicePoints={servicePoints}
        currentServicePointId={selectedServicePoint?.id || ""}
      />
    </div>
  );
};

export default InsQueueTabs;
