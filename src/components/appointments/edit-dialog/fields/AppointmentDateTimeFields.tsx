
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AppointmentFormValues } from '../types';
import { DateTimeFields } from '../../fields/shared/DateTimeFields';

interface AppointmentDateTimeFieldsProps {
  form: UseFormReturn<AppointmentFormValues>;
}

export const AppointmentDateTimeFields = ({ form }: AppointmentDateTimeFieldsProps) => {
  // Since our DateTimeFields component requires form values to have date and time properties,
  // we can safely cast our form to match that constraint as AppointmentFormValues includes these fields
  return <DateTimeFields form={form as UseFormReturn<AppointmentFormValues & { date: string; time: string }>} />;
};
