
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Props = {
  control: any;
};

const MedicationStockFields: React.FC<Props> = ({ control }) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={control}
      name="stock"
      render={({ field }) => (
        <FormItem>
          <FormLabel>จำนวนคงเหลือ</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="min_stock"
      render={({ field }) => (
        <FormItem>
          <FormLabel>จำนวนขั้นต่ำ</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export default MedicationStockFields;
