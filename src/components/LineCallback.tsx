// src/components/LineCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lineService } from '../services/line.service';
import { toast } from 'sonner';

const LineCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const state = queryParams.get('state');
        const errorParam = queryParams.get('error');
        
        if (errorParam) {
          setError(`LINE login error: ${errorParam}`);
          toast.error('LINE login failed');
          setTimeout(() => navigate('/patient-portal'), 3000);
          return;
        }

        if (!code || !state) {
          setError('Missing required parameters');
          toast.error('Invalid callback parameters');
          setTimeout(() => navigate('/patient-portal'), 3000);
          return;
        }

        // Verify state to prevent CSRF attacks
        const savedState = localStorage.getItem('lineLoginState');
        localStorage.removeItem('lineLoginState');
        
        if (state !== savedState) {
          setError('Security validation failed');
          toast.error('Security validation failed');
          setTimeout(() => navigate('/patient-portal'), 3000);
          return;
        }

        // Exchange code for tokens
        const tokenResponse = await lineService.getAccessToken(code);
        
        // Get user profile
        const profile = await lineService.getProfile(tokenResponse.access_token);
        
        // Store token and profile
        localStorage.setItem('lineToken', tokenResponse.access_token);
        localStorage.setItem('lineProfile', JSON.stringify(profile));
        
        // For your existing implementation:
        // Your app expects a phone number, so you'll need to:
        // 1. Either get the user's phone from LINE (if you have permission)
        // 2. Or ask them to enter it after LINE login
        
        // For now, we'll redirect to a form to collect phone
        navigate('/patient-portal/connect-phone', { 
          state: { 
            lineId: profile.userId,
            displayName: profile.displayName 
          } 
        });
        
      } catch (error) {
        console.error('LINE callback error:', error);
        toast.error('LINE login processing failed');
        setTimeout(() => navigate('/patient-portal'), 3000);
      }
    };

    processCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>เกิดข้อผิดพลาด</h2>
        <p>{error}</p>
        <p>กำลังนำคุณกลับไปยังหน้าล็อกอิน...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>กำลังประมวลผลการเข้าสู่ระบบ</h2>
      <p>โปรดรอสักครู่...</p>
    </div>
  );
};

export default LineCallback;