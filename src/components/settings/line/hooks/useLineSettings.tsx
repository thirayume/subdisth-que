
import { useLineSettingsState } from './useLineSettingsState';
import { useLineSettingsValidation } from './useLineSettingsValidation';
import { useLineSettingsActions } from './useLineSettingsActions';
import { useState, useEffect } from 'react'; 

export const useLineSettings = () => {
  // Fixed state declarations - must be at the top level of the hook
  const [initialized, setInitialized] = useState(false);

  // Get state management functionality
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
    handleTtsConfigChange
  } = useLineSettingsState();

  // Get validation functionality
  const {
    errors,
    validation,
    validateSettings,
    setErrors
  } = useLineSettingsValidation(lineSettings, isEditing);

  // Get action functionality
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

  // Mark as initialized after first render
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  return {
    // State
    isEditing,
    isTesting,
    isTestingMessage,
    lineSettings,
    ttsConfig,
    errors,
    validation,
    // Handlers
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage,
    handleChange,
    handleTtsConfigChange,
  };
};
