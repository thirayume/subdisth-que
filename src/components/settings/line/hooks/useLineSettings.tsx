
import { useLineSettingsState } from './useLineSettingsState';
import { useLineSettingsValidation } from './useLineSettingsValidation';
import { useLineSettingsActions } from './useLineSettingsActions';

export const useLineSettings = () => {
  const {
    isEditing,
    setIsEditing,
    isTesting,
    setIsTesting,
    isTestingMessage,
    setIsTestingMessage,
    lineSettings,
    setLineSettings,
    ttsConfig,
    setTtsConfig,
    handleChange,
    handleTtsConfigChange,
  } = useLineSettingsState();

  const {
    errors,
    validation,
    validateSettings,
    setErrors
  } = useLineSettingsValidation(lineSettings, isEditing);

  const {
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage
  } = useLineSettingsActions(
    lineSettings,
    ttsConfig,
    setIsEditing,
    setIsTesting,
    setIsTestingMessage,
    setLineSettings,
    setTtsConfig,
    validateSettings,
    setErrors
  );

  return {
    isEditing,
    isTesting,
    isTestingMessage,
    lineSettings,
    ttsConfig,
    errors,
    validation,
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage,
    handleChange,
    handleTtsConfigChange,
  };
};
