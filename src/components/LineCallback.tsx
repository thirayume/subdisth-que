// src/components/LineCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lineService } from '@/services/line.service';
import { toast } from 'sonner';

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
        
        // Get callback destination
        const callbackDestination = localStorage.getItem('lineLoginCallback') || '';
        
        // Handle different callback destinations
        if (callbackDestination === 'patient-portal') {
          // Store token in localStorage or sessionStorage
          localStorage.setItem('lineToken', tokenResponse.access_token);
          localStorage.setItem('lineProfile', JSON.stringify(tokenResponse.profile));
          
          // Navigate back to patient portal
          navigate('/patient-portal', { 
            state: { 
              lineLoginSuccess: true,
              userId: tokenResponse.profile?.userId,
              displayName: tokenResponse.profile?.displayName
            } 
          });
        } else {
          // Default navigation
          navigate('/', { state: { lineLoginSuccess: true } });
        }

        // Clean up
        localStorage.removeItem('lineLoginState');
        localStorage.removeItem('lineLoginCallback');
        
        toast.success('เข้าสู่ระบบสำเร็จ');
      } catch (err) {
        console.error('LINE callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        navigate('/');
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
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  return null;
};

export default LineCallback;