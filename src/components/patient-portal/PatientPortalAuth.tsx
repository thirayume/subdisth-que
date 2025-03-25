
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import LineLoginButton from '@/components/patient-portal/LineLoginButton';

interface PatientPortalAuthProps {
  onLoginSuccess: (token: string, userPhone: string) => void;
}

const PatientPortalAuth: React.FC<PatientPortalAuthProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">ระบบติดตามคิวผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <QrCode className="mx-auto h-16 w-16 text-pharmacy-600 mb-2" />
            <p className="text-gray-600">กรุณาเข้าสู่ระบบด้วย LINE เพื่อดูข้อมูลคิวและประวัติผู้ป่วย</p>
          </div>
          
          <LineLoginButton onLoginSuccess={onLoginSuccess} />
          
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => navigate('/')}>
              กลับไปหน้าหลัก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientPortalAuth;
