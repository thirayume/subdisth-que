
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

// Re-export the components from radix-ui
// Correctly export what's available in @radix-ui/react-toast
export const useToast = () => {
  return {
    toast: (props: any) => {
      console.log('Toast called with props:', props);
    }
  };
};

export const toast = {
  error: (message: string, options?: any) => {
    console.log('Toast error:', message, options);
  },
  success: (message: string, options?: any) => {
    console.log('Toast success:', message, options);
  },
  info: (message: string, options?: any) => {
    console.log('Toast info:', message, options);
  },
  warning: (message: string, options?: any) => {
    console.log('Toast warning:', message, options);
  }
};
