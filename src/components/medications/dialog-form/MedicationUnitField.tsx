
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import MedicationsUnitPopover from "../MedicationsUnitPopover";

type Props = {
  control: any;
  value: string;
  open: boolean;
  newUnitInput: string;
  setOpen: (open: boolean) => void;
  setValue: (val: string) => void;
  setNewUnitInput: (inp: string) => void;
  unitOptions: { value: string; label: string }[];
  handleAddNewUnit: () => void;
};

const MedicationUnitField: React.FC<Props> = ({
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
          <MedicationsUnitPopover
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

export default MedicationUnitField;
