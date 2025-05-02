// functions/line-token-exchange.js
const axios = require('axios');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { code } = JSON.parse(event.body);
    
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINE_CALLBACK_URL,
        client_id: process.env.LINE_CHANNEL_ID,
        client_secret: process.env.LINE_CHANNEL_SECRET
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(tokenResponse.data)
    };
  } catch (error) {
    console.error('LINE token exchange error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to exchange token' })
    };
  }
};