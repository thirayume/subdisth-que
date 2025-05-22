
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CreateQueueDialog from '@/components/queue/CreateQueueDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CreateQueue');

const CreateQueue: React.FC = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(true);
  
  // Automatically open the dialog when the page loads
  React.useEffect(() => {
    logger.debug('CreateQueue page mounted, opening dialog');
    setDialogOpen(true);
  }, []);
  
  // Handle dialog close by navigating back
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      logger.debug('Dialog closed, navigating back to queue management');
      navigate('/queue/management');
    }
  };
  
  // Handle successful queue creation
  const handleCreateQueue = (queue: any) => {
    logger.info('Queue created successfully', queue);
    // Navigate back to queue management after a short delay
    setTimeout(() => {
      navigate('/queue/management');
    }, 500); // Short delay to allow QR dialog to be seen if opened
  };
  
  return (
    <Layout>
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold">สร้างคิวใหม่</h1>
          <p className="text-gray-500">กรุณากรอกข้อมูลเพื่อสร้างคิวใหม่</p>
        </div>
        
        {/* This dialog will open automatically */}
        <CreateQueueDialog 
          open={dialogOpen} 
          onOpenChange={handleOpenChange} 
          onCreateQueue={handleCreateQueue}
        />
      </div>
    </Layout>
  );
};

export default CreateQueue;
