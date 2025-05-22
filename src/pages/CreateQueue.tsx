
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CreateQueueDialog from '@/components/queue/CreateQueueDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Card className="w-full max-w-md shadow-md">
            <CardHeader className="pb-2 text-center">
              <CardTitle>สร้างคิวใหม่</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6">
              <p className="text-gray-500 mb-6 text-center">กรุณาคลิกปุ่มด้านล่างเพื่อสร้างคิวใหม่</p>
              
              <Button 
                onClick={() => setDialogOpen(true)}
                className="bg-pharmacy-600 hover:bg-pharmacy-700 w-full max-w-xs py-6"
                size="lg"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                สร้างคิวใหม่
              </Button>
            </CardContent>
          </Card>
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
