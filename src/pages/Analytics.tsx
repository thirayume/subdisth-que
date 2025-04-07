
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useQueues } from '@/hooks/useQueues';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsContainer from '@/components/analytics/AnalyticsContainer';

const Analytics = () => {
  const { queues, sortQueues } = useQueues();

  return (
    <Layout>
      <AnalyticsHeader />
      <AnalyticsContainer queues={queues} sortQueues={sortQueues} />
    </Layout>
  );
};

export default Analytics;
