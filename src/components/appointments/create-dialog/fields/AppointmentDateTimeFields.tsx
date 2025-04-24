
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateAppointmentFormValues } from '../types';
import { DateTimeFields } from '../../fields/shared/DateTimeFields';

interface AppointmentDateTimeFieldsProps {
  form: UseFormReturn<CreateAppointmentFormValues>;
}

export const AppointmentDateTimeFields: React.FC<AppointmentDateTimeFieldsProps> = ({ form }) => {
  // Since our DateTimeFields component requires form values to have date and time properties,
  // we can safely cast our form to match that constraint as CreateAppointmentFormValues includes these fields
  return <DateTimeFields form={form as UseFormReturn<CreateAppointmentFormValues & { date: string; time: string }>} />;
};
