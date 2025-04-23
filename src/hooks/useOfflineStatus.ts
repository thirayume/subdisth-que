
import * as React from 'react';
import { toast } from 'sonner';

export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('การเชื่อมต่อกลับมาแล้ว คุณออนไลน์อยู่');
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.error('คุณกำลังออฟไลน์ บางฟีเจอร์อาจไม่ทำงาน');
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
