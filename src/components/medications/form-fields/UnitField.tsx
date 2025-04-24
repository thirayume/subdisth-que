
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { MedicationFormValues } from "../schemas/medicationSchema";
import UnitPopover from "../UnitPopover";

type Props = {
  control: Control<MedicationFormValues>;
  value: string;
  open: boolean;
  newUnitInput: string;
  setOpen: (open: boolean) => void;
  setValue: (val: string) => void;
  setNewUnitInput: (inp: string) => void;
  unitOptions: { value: string; label: string }[];
  handleAddNewUnit: () => void;
};

const UnitField: React.FC<Props> = ({
  control,
  value,
  open,
  newUnitInput,
  setOpen,
  setValue,
  setNewUnitInput,
  unitOptions,
  handleAddNewUnit,
}) => (
  <FormField
    control={control}
    name="unit"
    render={() => (
      <FormItem className="flex flex-col">
        <FormLabel>หน่วย</FormLabel>
        <FormControl>
          <UnitPopover
            unitOptions={unitOptions}
            value={value}
            open={open}
            newUnitInput={newUnitInput}
            setOpen={setOpen}
            setValue={setValue}
            setNewUnitInput={setNewUnitInput}
            handleAddNewUnit={handleAddNewUnit}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default UnitField;
