
import React from 'react';
import { Form } from '@/components/ui/form';
import { TabsContent } from '@/components/ui/tabs';
import GeneralSettings from '@/components/settings/GeneralSettings';
import QueueSettings from '@/components/settings/QueueSettings';
import LineSettings from '@/components/settings/LineSettings';
import SettingsFormActions from '@/components/settings/SettingsFormActions';
import { formatOptions } from '@/components/settings/schemas';
import { useSettingsContext } from '@/contexts/SettingsContext';

const SettingsForm: React.FC = () => {
  const { 
    form, 
    isSubmitting,
    editingQueueType,
    setEditingQueueType,
    newQueueType,
    setNewQueueType,
    onSubmit,
    handleAddQueueType,
    handleRemoveQueueType,
    handleEditQueueType,
    handleSaveQueueType,
    handleCancelEdit,
    handleDuplicateQueueType,
    handleQueueTypeChange
  } = useSettingsContext();
  
  const queueTypeActions = {
    handleAddQueueType,
    handleRemoveQueueType,
    handleEditQueueType,
    handleSaveQueueType,
    handleCancelEdit,
    handleDuplicateQueueType,
    handleQueueTypeChange
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TabsContent value="general" className="space-y-6">
          <GeneralSettings form={form} />
        </TabsContent>
        
        <TabsContent value="queue" className="space-y-6">
          <QueueSettings 
            form={form}
            formatOptions={formatOptions}
            editingQueueType={editingQueueType}
            setEditingQueueType={setEditingQueueType}
            newQueueType={newQueueType}
            setNewQueueType={setNewQueueType}
            {...queueTypeActions}
          />
        </TabsContent>
        
        <TabsContent value="line" className="space-y-6">
          <LineSettings />
        </TabsContent>
        
        <SettingsFormActions isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};

export default SettingsForm;
