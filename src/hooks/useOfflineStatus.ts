
import * as React from 'react';
import { toast } from '@/hooks/use-toast';

export const useOfflineStatus = () => {
  // Explicitly using React.useState to prevent any ambiguity
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "Connected",
        description: "การเชื่อมต่อกลับมาแล้ว คุณออนไลน์อยู่",
      });
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "Disconnected",
        description: "คุณกำลังออฟไลน์ บางฟีเจอร์อาจไม่ทำงาน",
        variant: "destructive"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOffline;
};
