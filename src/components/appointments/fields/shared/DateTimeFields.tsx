
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface DateTimeFieldsProps<T extends { date: string; time: string }> {
  form: UseFormReturn<T>;
}

export const DateTimeFields = <T extends { date: string; time: string }>({ form }: DateTimeFieldsProps<T>) => {
  return (
    <>
      <FormField
        control={form.control}
        name="date" as={"date"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>วันที่นัด</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="time" as={"time"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>เวลานัด</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
