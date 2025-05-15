
import React from 'react';
import { Form } from '@/components/ui/form';
import QueueSettings from './QueueSettings';
import GeneralSettings from './GeneralSettings';
import LineSettings from './LineSettings';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queueSettingsSchema } from './schemas';
import SettingsFormActions from './SettingsFormActions';
import ServicePointSettings from './ServicePointSettings';
import ServicePointQueueTypeSettings from './ServicePointQueueTypeSettings';

const SettingsForm: React.FC = () => {
  const { settings, onSubmit, isSubmitting } = useSettingsContext();

  return (
    <div className="space-y-6">
      <GeneralSettings />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServicePointSettings />
        <ServicePointQueueTypeSettings />
      </div>
      <Form {...settings.form}>
        <form onSubmit={settings.form.handleSubmit(onSubmit)} className="space-y-6">
          <QueueSettings />
          <SettingsFormActions isSubmitting={isSubmitting} />
        </form>
      </Form>
      <div className="space-y-6">
        <LineSettings />
      </div>
    </div>
  );
};

export default SettingsForm;
