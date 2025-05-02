
// Import from sonner directly
import { toast as sonnerToast } from 'sonner';

// Create a compatibility wrapper for old toast usage pattern
const compatibilityToast = (props: any) => {
  if (typeof props === 'string') {
    return sonnerToast(props);
  }
  
  if (props.title && props.description) {
    return sonnerToast(`${props.title}`, {
      description: props.description,
      ...(props.variant === 'destructive' ? { style: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' } } : {})
    });
  }
  
  return sonnerToast(props);
};

// Export the compatibility wrapper as toast
export const toast = Object.assign(compatibilityToast, sonnerToast);

// Export an empty useToast function for backward compatibility
export const useToast = () => {
  return {
    toast: compatibilityToast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  };
};
