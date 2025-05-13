
import React from 'react';
import Layout from '@/components/layout/Layout';
import SettingsTabs from '@/components/settings/SettingsTabs';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsLoading from '@/components/settings/SettingsLoading';
import SettingsForm from '@/components/settings/SettingsForm';
import { SettingsProvider, useSettingsContext } from '@/contexts/SettingsContext';

const SettingsContent: React.FC = () => {
  const { loading, loadingQueueTypes } = useSettingsContext();

  if (loading || loadingQueueTypes) {
    return <SettingsLoading />;
  }

  return (
    <>
      <SettingsHeader />
      <SettingsTabs>
        <SettingsForm />
      </SettingsTabs>
    </>
  );
};

const Settings = () => {
  return (
    <Layout>
      <SettingsProvider>
        <SettingsContent />
      </SettingsProvider>
    </Layout>
  );
};

export default Settings;
