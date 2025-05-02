
// Import from sonner directly
import { toast as sonnerToast } from 'sonner';

// Re-export toast function from sonner for use throughout the app
export const toast = sonnerToast;

// Export an empty useToast function for backward compatibility
export const useToast = () => {
  return {
    toast: sonnerToast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  };
};
