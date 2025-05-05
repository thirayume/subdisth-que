import React from "react";
import { Button } from "@/components/ui/button";
import { Queue, QueueStatus } from "@/integrations/supabase/schema";
import {
  PhoneOutgoing,
  RefreshCw,
  Check,
  SkipForward,
  AlertTriangle,
  Pause,
  Volume2,
  Bug,
  MessageSquare,
} from "lucide-react";
import { announceQueue } from "@/utils/textToSpeech";
import { toast } from "sonner";
import { lineNotificationService } from "@/services/line-notification.service";

interface QueueControlsProps {
  queue: Queue;
  onUpdateStatus: (queueId: string, status: QueueStatus) => void;
  onCallQueue: (queueId: string) => void;
  onRecallQueue: (queueId: string) => void;
  className?: string;
  patientName?: string;
  counterName?: string;
}

const QueueControls: React.FC<QueueControlsProps> = ({
  queue,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  className,
  patientName,
  counterName = "1",
}) => {
  // const [isDebugMode, setIsDebugMode] = React.useState(
  //   localStorage.getItem("tts_debug_mode") === "true"
  // );
  // const [isLineDebugMode, setIsLineDebugMode] = React.useState(
  //   localStorage.getItem("line_debug_mode") === "true"
  // );

  // // Add debug toggle handler
  // const handleToggleDebug = () => {
  //   const newState = toggleTTSDebug();
  //   setIsDebugMode(newState);
  // };

  // // Add LINE debug toggle handler
  // const handleToggleLineDebug = () => {
  //   const newState = !isLineDebugMode;
  //   localStorage.setItem("line_debug_mode", String(newState));
  //   setIsLineDebugMode(newState);
  //   toast.info(`LINE Debug Mode: ${newState ? "Enabled" : "Disabled"}`);
  // };

  // Function to send LINE notification using the service
  const handleSendLineNotification = async () => {
    try {
      // if (isLineDebugMode) {
      //   // Create debug container if not exists
      //   let debugContainer = document.getElementById("line-debug-container");
      //   if (!debugContainer) {
      //     debugContainer = document.createElement("div");
      //     debugContainer.id = "line-debug-container";
      //     debugContainer.style.position = "fixed";
      //     debugContainer.style.bottom = "10px";
      //     debugContainer.style.left = "10px";
      //     debugContainer.style.width = "400px";
      //     debugContainer.style.height = "300px";
      //     debugContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      //     debugContainer.style.color = "white";
      //     debugContainer.style.padding = "10px";
      //     debugContainer.style.overflow = "auto";
      //     debugContainer.style.zIndex = "9999";
      //     debugContainer.style.fontFamily = "monospace";
      //     debugContainer.style.fontSize = "12px";
      //     debugContainer.innerHTML =
      //       '<h3>LINE Debug Log</h3><div id="line-debug-log"></div>';

      //     // Add close button
      //     const closeButton = document.createElement("button");
      //     closeButton.innerText = "Close";
      //     closeButton.style.position = "absolute";
      //     closeButton.style.top = "10px";
      //     closeButton.style.right = "10px";
      //     closeButton.style.padding = "2px 8px";
      //     closeButton.style.backgroundColor = "#333";
      //     closeButton.style.color = "white";
      //     closeButton.style.border = "none";
      //     closeButton.style.borderRadius = "3px";
      //     closeButton.style.cursor = "pointer";
      //     closeButton.onclick = () => {
      //       document.body.removeChild(debugContainer!);
      //     };

      //     debugContainer.appendChild(closeButton);
      //     document.body.appendChild(debugContainer);
      //   }

        // Add log entry
        // const logDiv = debugContainer.querySelector("#line-debug-log");
        // if (logDiv) {
        //   const timestamp = new Date().toISOString().substr(11, 8);
        //   const message = `แจ้งเตือน: คิวหมายเลข ${queue.number} ถึงคิวของคุณแล้ว กรุณามาที่ช่องบริการ ${counterName}`;
        //   const logItem = document.createElement("div");
        //   logItem.innerHTML = `<span style="color:#aaa">[${timestamp}]</span> LINE Notification:`;
        //   logItem.innerHTML += `<pre style="color:#66ff66;margin:0;padding:4px 0 8px 12px;font-size:11px">${JSON.stringify(
        //     message,
        //     null,
        //     2
        //   )}</pre>`;
        //   logDiv.appendChild(logItem);
        //   logDiv.scrollTop = logDiv.scrollHeight;
        // }

      //   toast.info("LINE Notification Debug Mode - Message logged to panel");
      //   return;
      // }

      // Use the notification service
      const success = await lineNotificationService.sendQueueCalledNotification(
        queue.patient_id,
        queue,
        parseInt(counterName)
      );

      if (success) {
        toast.success("LINE notification sent successfully");
      } else {
        toast.error("Failed to send LINE notification");
      }
    } catch (error) {
      console.error("Error sending LINE notification:", error);
      toast.error("Failed to send LINE notification");
    }
  };

  // Function to handle queue announcement
  const handleAnnounceQueue = async () => {
    try {
      // Get announcement text from localStorage or use default
      const announcementText =
        localStorage.getItem("queue_announcement_text") ||
        "ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}";

      await announceQueue(
        queue.number,
        counterName,
        queue.type,
        announcementText
      );
      toast.info(`ประกาศเสียงเรียกคิวหมายเลข ${queue.number} เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Error announcing queue:", error);
      toast.error("ไม่สามารถประกาศเสียงเรียกคิวได้");
    }
  };

  // Merge the debug controls into a single group
  // const renderDebugControls = () => {
  //   if (
  //     process.env.NODE_ENV !== "production" ||
  //     window.location.pathname.includes("/admin")
  //   ) {
  //     return (
  //       <div className="ml-auto flex gap-1">
  //         <Button
  //           onClick={handleToggleDebug}
  //           variant="ghost"
  //           size="icon"
  //           title="Toggle TTS Debug Mode"
  //         >
  //           <Volume2
  //             className={`h-4 w-4 ${
  //               isDebugMode ? "text-red-500" : "text-gray-400"
  //             }`}
  //           />
  //         </Button>
  //         <Button
  //           onClick={handleToggleLineDebug}
  //           variant="ghost"
  //           size="icon"
  //           title="Toggle LINE Debug Mode"
  //         >
  //           <MessageSquare
  //             className={`h-4 w-4 ${
  //               isLineDebugMode ? "text-red-500" : "text-gray-400"
  //             }`}
  //           />
  //         </Button>
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {queue.status === "WAITING" && (
        <Button
          onClick={() => onCallQueue(queue.id)}
          className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
          size="sm"
        >
          <PhoneOutgoing className="h-4 w-4 mr-1" />
          เรียกคิว
        </Button>
      )}

      {queue.status === "ACTIVE" && (
        <>
          <Button
            onClick={() => onRecallQueue(queue.id)}
            variant="outline"
            size="sm"
            className="border-pharmacy-200 text-pharmacy-700 hover:bg-pharmacy-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            เรียกซ้ำ
          </Button>

          <Button
            onClick={handleAnnounceQueue}
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Volume2 className="h-4 w-4 mr-1" />
            ประกาศเสียง
          </Button>

          <Button
            onClick={() => onUpdateStatus(queue.id, "COMPLETED")}
            variant="outline"
            size="sm"
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Check className="h-4 w-4 mr-1" />
            เสร็จสิ้น
          </Button>

          <Button
            onClick={() => onUpdateStatus(queue.id, "SKIPPED")}
            variant="outline"
            size="sm"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            ข้ามคิว
          </Button>

          <Button
            onClick={() => onUpdateStatus(queue.id, "WAITING")}
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Pause className="h-4 w-4 mr-1" />
            พัก
          </Button>

          <Button
            onClick={handleSendLineNotification}
            variant="outline"
            size="sm"
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            แจ้งเตือน LINE
          </Button>

          {/* Replace the old debug controls with the unified version */}
          {/* {renderDebugControls()} */}
        </>
      )}

      {queue.status === "SKIPPED" && (
        <Button
          onClick={() => onCallQueue(queue.id)}
          variant="outline"
          size="sm"
          className="border-pharmacy-200 text-pharmacy-700 hover:bg-pharmacy-50"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          เรียกอีกครั้ง
        </Button>
      )}

      {queue.status === "COMPLETED" && (
        <span className="text-sm text-gray-500 italic">
          เสร็จสิ้นการให้บริการ
        </span>
      )}
    </div>
  );
};

export default QueueControls;