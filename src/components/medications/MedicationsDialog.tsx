
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMedications } from '@/hooks/useMedications';
import { Medication } from '@/integrations/supabase/schema';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  code: z.string().min(1, { message: 'กรุณาระบุรหัสยา' }),
  name: z.string().min(1, { message: 'กรุณาระบุชื่อยา' }),
  description: z.string().optional(),
  unit: z.string().min(1, { message: 'กรุณาระบุหน่วย' }),
  stock: z.coerce.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' }),
  min_stock: z.coerce.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' }),
});

type FormValues = z.infer<typeof formSchema>;

interface MedicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
}

const MedicationsDialog: React.FC<MedicationsDialogProps> = ({ 
  open, 
  onOpenChange,
  medication 
}) => {
  const { medications, addMedication, updateMedication } = useMedications();
  const isEditing = !!medication;
  const [newUnitInput, setNewUnitInput] = useState('');
  const [openUnitPopover, setOpenUnitPopover] = useState(false);
  
  // Extract unique unit values from medications
  const unitOptions = React.useMemo(() => {
    const units = new Set(medications.map(med => med.unit));
    return Array.from(units).map(unit => ({
      value: unit,
      label: unit
    }));
  }, [medications]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      unit: '',
      stock: 0,
      min_stock: 0,
    },
  });

  // Reset form when dialog opens/closes or medication changes
  React.useEffect(() => {
    if (open) {
      if (medication) {
        form.reset({
          code: medication.code,
          name: medication.name,
          description: medication.description || '',
          unit: medication.unit,
          stock: medication.stock,
          min_stock: medication.min_stock,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          unit: '',
          stock: 0,
          min_stock: 0,
        });
      }
      setNewUnitInput('');
    }
  }, [open, medication, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && medication) {
        await updateMedication(medication.id, values);
      } else {
        await addMedication(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  const handleAddNewUnit = () => {
    if (newUnitInput.trim() !== '') {
      form.setValue('unit', newUnitInput.trim());
      setOpenUnitPopover(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'แก้ไขรายการยา' : 'เพิ่มรายการยาใหม่'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อยา</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>หน่วย</FormLabel>
                  <Popover open={openUnitPopover} onOpenChange={setOpenUnitPopover}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openUnitPopover}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "เลือกหน่วย..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="ค้นหาหรือเพิ่มหน่วยใหม่..." 
                          value={newUnitInput}
                          onValueChange={setNewUnitInput}
                        />
                        <CommandEmpty>
                          {newUnitInput ? (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              className="flex items-center justify-start w-full px-2 py-1.5"
                              onClick={handleAddNewUnit}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              เพิ่ม "{newUnitInput}"
                            </Button>
                          ) : (
                            "ไม่พบหน่วยที่ค้นหา"
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {unitOptions.map((unit) => (
                            <CommandItem
                              key={unit.value}
                              value={unit.value}
                              onSelect={() => {
                                form.setValue('unit', unit.value);
                                setOpenUnitPopover(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === unit.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {unit.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationsDialog;
