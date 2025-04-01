
export interface LineSettings {
  channelId: string;
  channelSecret: string;
  accessToken: string;
  welcomeMessage: string;
  queueReceivedMessage: string;
  queueCalledMessage: string;
}

export interface LineSettingsValidation {
  channelId: boolean;
  channelSecret: boolean;
  accessToken: boolean;
  isFormValid: boolean;
}

export interface LineSettingsErrors {
  channelId?: string;
  channelSecret?: string;
  accessToken?: string;
}
