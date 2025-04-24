
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { MedicationFormValues } from "../schemas/medicationSchema";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  control: Control<MedicationFormValues>;
  unitOptions: string[];
  onAddNewUnit: (unit: string) => void;
};

const UnitField: React.FC<Props> = ({
  control,
  unitOptions,
  onAddNewUnit,
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return unitOptions;
    return unitOptions.filter(unit => 
      unit.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [unitOptions, searchQuery]);

  return (
    <FormField
      control={control}
      name="unit"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>หน่วย</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {field.value || "เลือกหน่วย..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="ค้นหาหรือเพิ่มหน่วยใหม่..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start px-2 py-1.5"
                        onClick={() => {
                          onAddNewUnit(searchQuery);
                          field.onChange(searchQuery);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        เพิ่มหน่วย "{searchQuery}"
                      </Button>
                    )}
                  </CommandEmpty>
                  <CommandGroup className="max-h-52 overflow-y-auto">
                    {filteredOptions.map((unit) => (
                      <CommandItem
                        key={unit}
                        value={unit}
                        onSelect={() => {
                          field.onChange(unit);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === unit ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {unit}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UnitField;
