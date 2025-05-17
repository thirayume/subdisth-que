
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
      <GeneralSettings form={settings.form} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServicePointSettings />
        <ServicePointQueueTypeSettings />
      </div>
      <Form {...settings.form}>
        <form onSubmit={settings.form.handleSubmit(onSubmit)} className="space-y-6">
          <QueueSettings 
            form={settings.form}
            editingQueueType={settings.editingQueueType}
            setEditingQueueType={settings.setEditingQueueType}
            newQueueType={settings.newQueueType}
            setNewQueueType={settings.setNewQueueType}
            handleAddQueueType={settings.handleAddQueueType}
            handleRemoveQueueType={settings.handleRemoveQueueType}
            handleEditQueueType={settings.handleEditQueueType}
            handleSaveQueueType={settings.handleSaveQueueType}
            handleCancelEdit={settings.handleCancelEdit}
            handleDuplicateQueueType={settings.handleDuplicateQueueType}
            handleQueueTypeChange={settings.handleQueueTypeChange}
          />
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
