// src/services/line.service.ts
export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

export interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

class LineService {
  async getAccessToken(code: string): Promise<LineTokenResponse> {
    const response = await fetch('/api/line-token-exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange token');
    }

    return await response.json();
  }

  async getProfile(accessToken: string): Promise<LineProfile> {
    const response = await fetch('/api/line-profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get LINE profile');
    }

    return await response.json();
  }

  generateLoginUrl(state: string): string {
    const LINE_CHANNEL_ID = import.meta.env.VITE_LINE_CHANNEL_ID;
    const LINE_CALLBACK_URL = import.meta.env.VITE_LINE_CALLBACK_URL;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINE_CHANNEL_ID,
      redirect_uri: LINE_CALLBACK_URL,
      state: state,
      scope: 'profile openid email',
      nonce: Math.random().toString(36).substring(2, 15)
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }
}

export const lineService = new LineService();