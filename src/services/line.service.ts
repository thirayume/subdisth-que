// src/services/line.service.ts
import axios from 'axios';
import { LineProfile } from '../components/settings/line/types';

interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  profile?: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  };
}

class LineService {
  private channelId: string;
  private redirectUri: string;

  constructor() {
    this.channelId = import.meta.env.VITE_LINE_CHANNEL_ID || '';
    this.redirectUri = import.meta.env.VITE_LINE_CALLBACK_URL || `${window.location.origin}/auth/line/callback`;
  }

  generateLoginUrl(state: string): string {
    // Save state to localStorage for verification in callback
    localStorage.setItem('lineLoginState', state);
    
    const baseUrl = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.channelId,
      redirect_uri: this.redirectUri,
      state,
      scope: 'profile openid email', // Added email scope
      bot_prompt: 'normal'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async exchangeToken(code: string): Promise<LineTokenResponse> {
    try {
      const response = await axios.post('/api/line-token-exchange', {
        code,
        redirectUri: this.redirectUri
      });
      
      // Log to debug
      console.log("LINE token exchange complete. Response contains profile:", !!response.data.profile);
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging LINE token:', error);
      throw new Error('Failed to exchange LINE token');
    }
  }

  async handleCallback(code: string): Promise<LineProfile> {
    try {
      const tokenResponse = await this.exchangeToken(code);
      
      // If profile is included in the token response
      if (tokenResponse.profile) {
        return {
          userId: tokenResponse.profile.userId,
          displayName: tokenResponse.profile.displayName,
          pictureUrl: tokenResponse.profile.pictureUrl
        };
      }
      
      // Otherwise fetch the profile separately
      const profile = await this.getProfile(tokenResponse.access_token);
      return profile;
    } catch (error) {
      console.error('Error handling LINE callback:', error);
      throw new Error('Failed to handle LINE callback');
    }
  }

  async getProfile(accessToken: string): Promise<LineProfile> {
    try {
      const response = await axios.get('/api/line-profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting LINE profile:', error);
      throw new Error('Failed to get LINE profile');
    }
  }

  // Get LINE user ID from localStorage
  getUserId(): string | null {
    return localStorage.getItem('lineUserId');
  }

  // Store LINE user ID to localStorage
  storeUserId(userId: string): void {
    localStorage.setItem('lineUserId', userId);
  }

  // Clear LINE authentication data
  clearAuth(): void {
    localStorage.removeItem('lineToken');
    localStorage.removeItem('lineUserId');
    localStorage.removeItem('lineProfile');
    localStorage.removeItem('lineLoginState');
  }

  // Method to send notifications (added for interface compliance)
  async sendNotification(userId: string, message: string): Promise<void> {
    try {
      await axios.post('/api/line-send-notification', {
        userId,
        message
      });
    } catch (error) {
      console.error('Error sending LINE notification:', error);
      throw new Error('Failed to send LINE notification');
    }
  }

  // Method to get LINE profile (added for interface compliance)
  async getLINEProfile(userId: string): Promise<any> {
    try {
      const response = await axios.post('/api/line-profile', {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error getting LINE profile:', error);
      throw new Error('Failed to get LINE profile');
    }
  }
}

export const lineService = new LineService();
