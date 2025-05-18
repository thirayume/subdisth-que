
import { QueueAlgorithmType } from "@/utils/queueAlgorithms";
import { QueueTypeSchema } from "@/components/settings/schemas";

// Re-export QueueTypeSchema as QueueType for backward compatibility
export type QueueType = {
  id: string;
  code: string;
  name: string;
  prefix: string;  // Required field
  purpose: string;
  format: '0' | '00' | '000';
  enabled: boolean;
  algorithm: QueueAlgorithmType;
  priority: number;
};

// You can add other hooks or functionality related to queue types here
