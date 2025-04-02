
import { useState, useEffect } from 'react';
import { LineSettings, LineSettingsValidation, LineSettingsErrors } from '../types';

export const useLineSettingsValidation = (
  lineSettings: LineSettings,
  isEditing: boolean
) => {
  const [errors, setErrors] = useState<LineSettingsErrors>({});
  const [validation, setValidation] = useState<LineSettingsValidation>({
    channelId: true,
    channelSecret: true,
    accessToken: true,
    isFormValid: true
  });

  // Validate settings whenever they change during editing
  useEffect(() => {
    if (isEditing) {
      validateSettings();
    }
  }, [lineSettings, isEditing]);

  const validateSettings = () => {
    const newErrors: LineSettingsErrors = {};
    let newValidation = {
      channelId: true,
      channelSecret: true,
      accessToken: true,
      isFormValid: true
    };

    // Channel ID validation - should be numeric and at least 5 characters
    if (!/^\d{5,}$/.test(lineSettings.channelId)) {
      newErrors.channelId = 'Channel ID ต้องเป็นตัวเลขและมีความยาวอย่างน้อย 5 หลัก';
      newValidation.channelId = false;
      newValidation.isFormValid = false;
    }

    // Channel Secret validation - should be at least 20 characters
    if (lineSettings.channelSecret.length < 20) {
      newErrors.channelSecret = 'Channel Secret ต้องมีความยาวอย่างน้อย 20 ตัวอักษร';
      newValidation.channelSecret = false;
      newValidation.isFormValid = false;
    }

    // Access Token validation - should be at least 30 characters
    if (lineSettings.accessToken.length < 30) {
      newErrors.accessToken = 'Access Token ต้องมีความยาวอย่างน้อย 30 ตัวอักษร';
      newValidation.accessToken = false;
      newValidation.isFormValid = false;
    }

    setErrors(newErrors);
    setValidation(newValidation);
    
    return newValidation.isFormValid;
  };

  return {
    errors,
    validation,
    validateSettings,
    setErrors
  };
};
