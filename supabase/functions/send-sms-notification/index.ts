
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsRequest {
  phoneNumber: string;
  message: string;
  queueNumber: string;
  patientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, queueNumber, patientName }: SmsRequest = await req.json();

    console.log(`Sending SMS to ${phoneNumber} for queue ${queueNumber} (${patientName})`);

    // Format phone number - ensure it starts with country code
    let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '66' + formattedPhone.substring(1); // Replace leading 0 with 66
    }

    const encodedParams = new URLSearchParams();
    encodedParams.set('msisdn', formattedPhone);
    encodedParams.set('message', message);
    encodedParams.set('sender', 'Nattharida');

    const smsResponse = await fetch('https://api-v2.thaibulksms.com/sms', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': 'Basic dzlIeWpBdkFPNTRlYUJ5d0t2elJmT0ExOHprSmFhOkpPTFhVaDVqT3E0WW1zRW1BVUN1RnNHVFptOWJlcg=='
      },
      body: encodedParams
    });

    const result = await smsResponse.json();
    
    console.log(`SMS result for ${queueNumber}:`, result);

    return new Response(JSON.stringify({ 
      success: true, 
      result,
      phoneNumber: formattedPhone,
      queueNumber 
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
