
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface LineQRCodeProps {
  queueNumber: number;
  size?: number;
}

const LineQRCode: React.FC<LineQRCodeProps> = ({ queueNumber, size = 150 }) => {
  // In a real implementation, this would be a LINE Bot deep link
  // For now, we'll use a link to our patient portal
  const patientPortalUrl = `${window.location.origin}/patient-portal?queue=${queueNumber}`;
  
  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG
        value={patientPortalUrl}
        size={size}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
      />
      <div className="text-xs text-gray-500 mt-1">LINE QR Code</div>
    </div>
  );
};

export default LineQRCode;
