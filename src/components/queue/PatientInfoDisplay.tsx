
import React from 'react';
import { User, Phone } from 'lucide-react';

interface PatientInfoDisplayProps {
  patientName?: string;
  patientPhone?: string;
  formattedQueueNumber: string;
}

const PatientInfoDisplay: React.FC<PatientInfoDisplayProps> = ({
  patientName,
  patientPhone,
  formattedQueueNumber,
}) => {
  return (
    <div className="text-center mb-4">
      <p className="text-lg font-medium text-pharmacy-700">
        คิวหมายเลข: <span className="text-2xl">{formattedQueueNumber}</span>
      </p>
      
      {patientName && (
        <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
          <User className="h-3.5 w-3.5" />
          <span>{patientName}</span>
        </div>
      )}
      
      {patientPhone && (
        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5" />
          <span>{patientPhone}</span>
        </div>
      )}
      
      <p className="text-sm text-gray-500 mt-2">สแกน QR Code เพื่อติดตามคิวบน LINE</p>
    </div>
  );
};

export default PatientInfoDisplay;
