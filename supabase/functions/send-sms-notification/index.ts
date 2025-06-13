
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsRequest {
  phoneNumber: string;
  message?: string;
  queueNumber: string;
  patientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get SMS settings from database
    const { data: smsSettings, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'sms');

    if (settingsError) {
      console.error('Error fetching SMS settings:', settingsError);
      throw new Error('Failed to fetch SMS settings');
    }

    // Parse settings
    const settings: Record<string, any> = {};
    smsSettings?.forEach((setting: any) => {
      try {
        // Parse JSON values, handle boolean strings
        if (setting.key === 'enabled') {
          settings[setting.key] = setting.value === 'true' || setting.value === true;
        } else if (typeof setting.value === 'string' && setting.value.startsWith('"')) {
          settings[setting.key] = JSON.parse(setting.value);
        } else {
          settings[setting.key] = setting.value;
        }
      } catch (e) {
        settings[setting.key] = setting.value;
      }
    });

    // Check if SMS is enabled
    if (!settings.enabled) {
      console.log('SMS is disabled in settings');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'SMS notifications are disabled' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Validate required settings
    if (!settings.authorization_header) {
      console.error('SMS authorization header not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'SMS authorization header not configured' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { phoneNumber, message, queueNumber, patientName }: SmsRequest = await req.json();

    console.log(`Sending SMS to ${phoneNumber} for queue ${queueNumber} (${patientName})`);

    // Use message from request or generate from template
    let finalMessage = message;
    if (!finalMessage && settings.message_template) {
      // Find service point name (placeholder for now)
      const servicePointName = 'ช่องบริการ';
      finalMessage = settings.message_template
        .replace('{queueNumber}', queueNumber)
        .replace('{servicePoint}', servicePointName);
    }

    if (!finalMessage) {
      finalMessage = `ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข ${queueNumber}`;
    }

    // Use phone number as is (don't modify format)
    const formattedPhone = phoneNumber;

    const encodedParams = new URLSearchParams();
    encodedParams.set('msisdn', formattedPhone);
    encodedParams.set('message', finalMessage);
    encodedParams.set('sender', settings.sender_name || 'Hospital');

    const smsResponse = await fetch('https://api-v2.thaibulksms.com/sms', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': settings.authorization_header
      },
      body: encodedParams
    });

    const result = await smsResponse.json();
    
    console.log(`SMS result for ${queueNumber}:`, result);

    return new Response(JSON.stringify({ 
      success: true, 
      result,
      phoneNumber: formattedPhone,
      queueNumber,
      message: finalMessage
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
