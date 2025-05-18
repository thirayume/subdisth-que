
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

// Function to validate queue type
export const validateQueueType = (queueType: Partial<QueueType>): boolean => {
  // Required fields: id, code, name, prefix
  if (!queueType.id || !queueType.code || !queueType.name || !queueType.prefix) {
    return false;
  }
  
  return true;
};

// Function to get default values for a new queue type
export const getDefaultQueueType = (): QueueType => {
  return {
    id: '',
    code: '',
    name: '',
    prefix: '',
    purpose: '',
    format: '00',
    enabled: true,
    algorithm: QueueAlgorithmType.FIFO,
    priority: 5
  };
};

// Functions to convert between QueueType and QueueTypeSchema
export const queueTypeToSchema = (queueType: QueueType): QueueTypeSchema => {
  return {
    id: queueType.id,
    code: queueType.code,
    name: queueType.name,
    prefix: queueType.prefix,
    purpose: queueType.purpose,
    format: queueType.format,
    enabled: queueType.enabled,
    algorithm: queueType.algorithm,
    priority: queueType.priority
  };
};

export const schemaToQueueType = (schema: QueueTypeSchema): QueueType => {
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    prefix: schema.prefix,
    purpose: schema.purpose,
    format: schema.format,
    enabled: schema.enabled,
    algorithm: schema.algorithm,
    priority: schema.priority
  };
};
