// src/components/LineCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lineService } from '@/services/line.service';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LineCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Check for errors from LINE
        if (error) {
          throw new Error(errorDescription || 'LINE login failed');
        }

        // Validate state to prevent CSRF
        const savedState = localStorage.getItem('lineLoginState');
        if (!state || state !== savedState) {
          throw new Error('Invalid state parameter');
        }

        // Validate code
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for token
        const tokenResponse = await lineService.exchangeToken(code);
        
        // Store token and user information
        localStorage.setItem('lineToken', tokenResponse.access_token);
        
        // In the handleCallback function, when redirecting to connect-phone
        // Extract and pass all available profile information
        if (tokenResponse.profile) {
          const lineProfile = tokenResponse.profile;
          localStorage.setItem('lineProfile', JSON.stringify(lineProfile));
          localStorage.setItem('lineUserId', lineProfile.userId);
          
          // Extract email from id_token if available
          let email = null;
          if (tokenResponse.id_token) {
            try {
              // Decode the JWT without verification (client-side only)
              const base64Url = tokenResponse.id_token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));

              const decoded = JSON.parse(jsonPayload);
              email = decoded.email;
            } catch (e) {
              console.error('Error decoding id_token:', e);
            }
          }
          
          // Navigate to connect phone page with all profile information
          navigate('/patient-portal/connect-phone', { 
            state: { 
              lineLoginSuccess: true,
              lineUserId: lineProfile.userId,
              displayName: lineProfile.displayName,
              pictureUrl: lineProfile.pictureUrl,
              email: email
            }
          });
          return;
        }
        
        // Clean up
        localStorage.removeItem('lineLoginState');
        
        // Default navigation if no profile
        navigate('/patient-portal');
        toast.success('เข้าสู่ระบบสำเร็จ');
      } catch (err) {
        console.error('LINE callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-lg">กำลังดำเนินการเข้าสู่ระบบ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>เกิดข้อผิดพลาด: {error}</p>
        </div>
        <button 
          onClick={() => navigate('/patient-portal')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          กลับสู่หน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

  return null;
};

export default LineCallback;