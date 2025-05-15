
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { ServicePoint } from '@/integrations/supabase/schema';
import { useServicePoints } from '@/hooks/useServicePoints';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ServicePointSettings: React.FC<{ className?: string }> = ({ className }) => {
  const { servicePoints, loading, saveServicePoint, deleteServicePoint } = useServicePoints();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<ServicePoint>>({
    code: '',
    name: '',
    location: '',
    enabled: true
  });

  const handleEdit = (servicePoint: ServicePoint) => {
    setFormData({
      id: servicePoint.id,
      code: servicePoint.code,
      name: servicePoint.name,
      location: servicePoint.location || '',
      enabled: servicePoint.enabled
    });
    setEditingId(servicePoint.id);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setFormData({
      code: '',
      name: '',
      location: '',
      enabled: true
    });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleChange = (field: keyof ServicePoint, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name) {
        toast.error('กรุณากรอกรหัสและชื่อจุดบริการ');
        return;
      }
      
      await saveServicePoint(formData);
      setEditingId(null);
      setIsAdding(false);
      toast.success('บันทึกจุดบริการเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error saving service point:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteServicePoint(id);
    } catch (err) {
      console.error('Error deleting service point:', err);
    }
  };

  const renderForm = () => (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">รหัสจุดบริการ</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={e => handleChange('code', e.target.value)}
            placeholder="รหัสจุดบริการ เช่น SP01"
          />
        </div>
        <div>
          <Label htmlFor="name">ชื่อจุดบริการ</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="ชื่อจุดบริการ"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="location">ตำแหน่ง (ไม่บังคับ)</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={e => handleChange('location', e.target.value)}
          placeholder="ตำแหน่งของจุดบริการ"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={value => handleChange('enabled', value)}
        />
        <Label htmlFor="enabled">เปิดใช้งานจุดบริการ</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-2" />
          ยกเลิก
        </Button>
        <Button type="button" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          บันทึก
        </Button>
      </div>
    </div>
  );

  const renderServicePointItem = (servicePoint: ServicePoint) => {
    const isEditing = editingId === servicePoint.id;
    
    if (isEditing) {
      return renderForm();
    }

    return (
      <div key={servicePoint.id} className="flex items-center justify-between border-b py-4 last:border-0">
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="font-medium">{servicePoint.code}</span>
            {!servicePoint.enabled && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">ปิดการใช้งาน</span>
            )}
          </div>
          <div className="text-sm text-gray-500">{servicePoint.name}</div>
          {servicePoint.location && <div className="text-xs text-gray-400">{servicePoint.location}</div>}
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(servicePoint)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการลบจุดบริการ</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณต้องการลบจุดบริการ {servicePoint.name} ({servicePoint.code}) ใช่หรือไม่?
                  การลบจะไม่สามารถเรียกคืนได้
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(servicePoint.id)}>ลบ</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>จุดบริการ</CardTitle>
            <CardDescription>
              จัดการจุดบริการที่จะให้บริการคิวประเภทต่าง ๆ
            </CardDescription>
          </div>
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" /> เพิ่มจุดบริการ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && renderForm()}
        
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-4">กำลังโหลด...</div>
          ) : servicePoints.length === 0 ? (
            <div className="text-center py-4 text-gray-500">ไม่พบข้อมูลจุดบริการ</div>
          ) : (
            servicePoints.map(servicePoint => (
              <div key={servicePoint.id}>
                {renderServicePointItem(servicePoint)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicePointSettings;
