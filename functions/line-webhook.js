const crypto = require('crypto');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Verify signature
  const signature = event.headers['x-line-signature'];
  const body = event.body;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  
  const expectedSignature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  
  if (signature !== expectedSignature) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  try {
    const data = JSON.parse(body);
    
    // Process webhook events
    const events = data.events || [];
    for (const event of events) {
      // Handle different event types
      switch (event.type) {
        case 'message':
          // Handle message events
          console.log('Received message:', event.message);
          break;
        case 'follow':
          // Handle follow events
          console.log('User followed:', event.source.userId);
          break;
        // Add other event types as needed
      }
    }
    
    // LINE API requires a 200 response
    return { statusCode: 200, body: '' };
  } catch (error) {
    console.error('LINE webhook error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error processing webhook' }) };
  }
};