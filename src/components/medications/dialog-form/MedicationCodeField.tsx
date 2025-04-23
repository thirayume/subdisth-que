
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Props = {
  control: any; // react-hook-form control
};

const MedicationCodeField: React.FC<Props> = ({ control }) => (
  <FormField
    control={control}
    name="code"
    render={({ field }) => (
      <FormItem>
        <FormLabel>รหัสยา</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default MedicationCodeField;
