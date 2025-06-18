
import React from 'react';
import Layout from '@/components/layout/Layout';
import UserManagementContainer from '@/components/user-management/UserManagementContainer';

const UserManagement: React.FC = () => {
  return (
    <Layout>
      <UserManagementContainer />
    </Layout>
  );
};

export default UserManagement;
