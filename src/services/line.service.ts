// src/services/line.service.ts
import { LineProfile, LineTokenResponse } from '../components/settings/types';

class LineService {
  private readonly channelId: string;
  private readonly redirectUri: string;
  private readonly apiBaseUrl: string = 'https://api.line.me';

  constructor() {
    this.channelId = process.env.LINE_CHANNEL_ID || '';
    this.redirectUri = process.env.LINE_CALLBACK_URL || '';
    
    if (!this.channelId || !this.redirectUri) {
      console.error('LINE configuration is missing or incomplete');
    }
  }

  /**
   * Generate the LINE login URL
   */
  generateLoginUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.channelId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: 'profile openid',
      nonce: this.generateNonce(),
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  /**
   * Generate a random nonce for security
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Exchange authorization code for access token
   * Note: This should be done in your backend for security
   */
  async getAccessToken(code: string): Promise<LineTokenResponse> {
    // In a real implementation, this should be a call to your backend API
    // that handles the token exchange securely
    const response = await fetch('/api/auth/line/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to get LINE access token');
    }

    return await response.json();
  }

  /**
   * Get user profile with access token
   * Note: This should also be done in your backend
   */
  async getProfile(accessToken: string): Promise<LineProfile> {
    // In a real implementation, this should be a call to your backend API
    const response = await fetch('/api/auth/line/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get LINE profile');
    }

    return await response.json();
  }

  /**
   * Handle LINE login callback
   */
  async handleCallback(code: string): Promise<LineProfile> {
    const tokenResponse = await this.getAccessToken(code);
    return await this.getProfile(tokenResponse.access_token);
  }
}

export const lineService = new LineService();
