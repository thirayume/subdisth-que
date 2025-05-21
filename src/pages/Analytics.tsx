
import * as React from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import Layout from '@/components/layout/Layout';
import { useQueues } from '@/hooks/useQueues';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsContainer from '@/components/analytics/AnalyticsContainer';
import { Queue } from '@/integrations/supabase/schema';

const Analytics = () => {
  const { queues, sortQueues } = useQueues();

  // Create a wrapper function that matches the expected signature
  const sortQueuesWrapper = (queues: Queue[]): Queue[] => {
    return sortQueues ? sortQueues(queues) : queues;
  };

  return (
    <Layout>
      <DirectionProvider dir="ltr">
        <AnalyticsHeader />
        <AnalyticsContainer queues={queues} sortQueues={sortQueuesWrapper} />
      </DirectionProvider>
    </Layout>
  );
};

export default Analytics;
