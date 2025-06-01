
const axios = require('axios');

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { code, redirectUri } = requestBody;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' })
      };
    }

    // LINE API credentials
    const channelId = process.env.LINE_CHANNEL_ID;
    const channelSecret = process.env.LINE_CHANNEL_SECRET;

    if (!channelId || !channelSecret) {
      console.error('LINE credentials not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    console.log(`Exchanging code for token with redirect URI: ${redirectUri}`);

    // Exchange code for token
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri || 'https://subdisth-que.netlify.app/auth/line/callback',
        client_id: channelId,
        client_secret: channelSecret
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Received token response:', JSON.stringify(tokenResponse.data));

    // Get user profile with the access token
    const accessToken = tokenResponse.data.access_token;
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log('Received profile response:', JSON.stringify(profileResponse.data));

    // Return both token and profile information
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...tokenResponse.data,
        profile: profileResponse.data
      })
    };
  } catch (error) {
    console.error('LINE token exchange error:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to exchange token',
        details: error.response?.data || error.message
      })
    };
  }
};
