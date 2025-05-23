
import React from 'react';
import Layout from '@/components/layout/Layout';
import QueueManagementContainer from '@/components/queue/management/QueueManagementContainer';

const QueueManagement = () => {
  return (
    <Layout className="overflow-hidden">
      <QueueManagementContainer />
    </Layout>
  );
};

export default QueueManagement;
