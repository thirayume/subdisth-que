
import React from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import Layout from '@/components/layout/Layout';
import { useQueues } from '@/hooks/useQueues';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsContainer from '@/components/analytics/AnalyticsContainer';

const Analytics = () => {
  const { queues, sortQueues } = useQueues();

  return (
    <Layout>
      <DirectionProvider dir="ltr">
        <AnalyticsHeader />
        <AnalyticsContainer queues={queues} sortQueues={sortQueues} />
      </DirectionProvider>
    </Layout>
  );
};

export default Analytics;
