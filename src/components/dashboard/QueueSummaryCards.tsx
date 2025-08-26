import React from "react";
import { Queue } from "@/integrations/supabase/schema";
import QueueStats from "../queue/QueueStats";

interface QueueSummaryCardsProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  queues: Queue[];
  avgWaitTime?: number;
  avgServiceTime?: number;
  avgServiceTimeToday?: number;
  avgWaitTimeToday?: number;
  isSimulationMode?: boolean;
}

const QueueSummaryCards: React.FC<QueueSummaryCardsProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  queues,
  avgWaitTime,
  avgServiceTime,
  avgServiceTimeToday,
  avgWaitTimeToday,
  isSimulationMode = false,
}) => {
  // Calculate predicted wait time based on number of waiting queues and average service time
  const predictedWaitTime = avgServiceTimeToday
    ? Math.round(
        (waitingQueues.length * avgServiceTimeToday) /
          Math.max(activeQueues.length, 1)
      ) //จำนวนคิวที่รออยู่*ค่าเฉลี่ยของเวลาที่เข้ารับบริการ/คิวที่ถูกเรียก(ถ้าไม่มี=0,มี=1)
    : undefined;
  console.log("predictedWaitTime", predictedWaitTime);
  console.log("waitingQueues", waitingQueues);
  // Get unique patient IDs to count total patients
  const uniquePatientIds = new Set(queues.map((queue) => queue.patient_id));
  const totalPatients = uniquePatientIds.size;

  console.log("avgWaitTimeToday", avgWaitTimeToday);
  console.log("avgServiceTimeToday", avgServiceTimeToday);

  return (
    <div className="mb-6">
      <QueueStats
        totalQueues={completedQueues.length}
        totalPatients={totalPatients}
        avgWaitingTime={avgWaitTime}
        avgServiceTime={avgServiceTime}
        predictedWaitTime={predictedWaitTime}
        avgWaitTimeToday={Math.round(avgWaitTimeToday) || 0}
        avgServiceTimeToday={avgServiceTimeToday}
        queueDistribution={{
          regular: waitingQueues.filter((q) => q.type === "GENERAL").length,
          urgent: waitingQueues.filter((q) => q.type === "URGENT").length,
          elderly: waitingQueues.filter((q) => q.type === "ELDERLY").length,
          special: waitingQueues.filter((q) => q.type === "APPOINTMENT").length,
        }}
        queueTypeNames={{
          regular: "ทั่วไป",
          urgent: "ด่วน",
          elderly: "ผู้สูงอายุ",
          special: "นัดหมาย",
        }}
        isSimulationMode={isSimulationMode}
      />
    </div>
  );
};

export default QueueSummaryCards;
