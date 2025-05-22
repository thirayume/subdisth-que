
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CreateQueueDialog from '@/components/queue/CreateQueueDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CreateQueue');

const CreateQueue: React.FC = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
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
          <h1 className="text-2xl font-bold text-gray-900">สร้างคิวใหม่</h1>
          <p className="text-gray-500">กรุณาคลิกปุ่มด้านล่างเพื่อสร้างคิวใหม่</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-lg bg-white rounded-md shadow p-8 text-center">
            <p className="text-gray-600 mb-8">
              กดปุ่มด้านล่างเพื่อเริ่มการสร้างคิวใหม่
            </p>
            
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-pharmacy-600 hover:bg-pharmacy-700 py-6 px-10"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              สร้างคิวใหม่
            </Button>
          </div>
        </div>
        
        {/* Dialog will only open when button is clicked */}
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
