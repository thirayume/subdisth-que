
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronRight, Calendar } from 'lucide-react';
import { Appointment, Patient } from '@/integrations/supabase/schema';

interface AppointmentsListProps {
  appointments: Appointment[];
  getPatientName: (patientId: string) => string;
  emptyMessage: string;
  iconBgColor: string;
  iconColor: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  getPatientName,
  emptyMessage,
  iconBgColor,
  iconColor
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center p-4 hover:bg-gray-50">
                <div className={`w-14 h-14 flex-shrink-0 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor} mr-4`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getPatientName(appointment.patient_id)}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {appointment.purpose}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(appointment.date), 'HH:mm น.', { locale: th })}
                  </p>
                </div>
                <div className="ml-4">
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;
