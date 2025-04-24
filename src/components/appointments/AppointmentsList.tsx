import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { useAppointments } from '@/hooks/appointments/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import AppointmentItem from './AppointmentItem';
import EditAppointmentDialog from './edit-dialog/EditAppointmentDialog';
import { AppointmentFormValues } from './edit-dialog/types';
import DeleteAppointmentDialog from './DeleteAppointmentDialog';

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
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  
  const { updateAppointment, deleteAppointment } = useAppointments();
  const { patients } = usePatients();
  
  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (appointmentToDelete) {
      await deleteAppointment(appointmentToDelete);
      setAppointmentToDelete(null);
    }
  };

  const onSubmit = async (values: AppointmentFormValues) => {
    if (!editingAppointment) return;
    
    const { date, time, ...rest } = values;
    
    // Combine date and time into a single ISO string
    const combinedDate = new Date(`${date}T${time}`);
    
    const updated = await updateAppointment(editingAppointment.id, {
      ...rest,
      date: combinedDate.toISOString(),
      status: rest.status as AppointmentStatus // Explicitly cast to ensure correct typing
    });
    
    if (updated) {
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((appointment) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  getPatientName={getPatientName}
                  iconBgColor={iconBgColor}
                  iconColor={iconColor}
                  onEdit={openEditDialog}
                  onDelete={setAppointmentToDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        appointment={editingAppointment}
        patients={patients}
        onSubmit={onSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAppointmentDialog
        open={!!appointmentToDelete}
        onOpenChange={(open) => !open && setAppointmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default AppointmentsList;
