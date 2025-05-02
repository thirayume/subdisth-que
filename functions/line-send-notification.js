// functions/line-send-notification.js
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
    const { lineUserId, message, queueId } = requestBody;

    if (!lineUserId || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'LINE user ID and message are required' })
      };
    }

    // LINE API credentials
    const channelAccessToken = process.env.LINE_MESSAGING_API_TOKEN;

    if (!channelAccessToken) {
      console.error('LINE messaging API token not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Send message using LINE Messaging API
    const response = await axios.post('https://api.line.me/v2/bot/message/push', 
      {
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${channelAccessToken}`
        }
      }
    );

    // Log the notification for tracking
    console.log(`LINE notification sent to ${lineUserId} for queue ${queueId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Notification sent successfully'
      })
    };
  } catch (error) {
    console.error('LINE notification error:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send notification',
        details: error.response?.data || error.message
      })
    };
  }
};