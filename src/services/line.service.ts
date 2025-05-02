import axios from 'axios';

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
    const baseUrl = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.channelId, // LINE API uses client_id in the URL params
      redirect_uri: this.redirectUri,
      state,
      scope: 'profile openid',
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
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging LINE token:', error);
      throw new Error('Failed to exchange LINE token');
    }
  }

  async getProfile(accessToken: string) {
    try {
      const response = await axios.get('https://api.line.me/v2/profile', {
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
}

export const lineService = new LineService();