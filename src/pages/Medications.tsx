
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import { mockMedications } from '@/lib/mockData';
import { toast } from 'sonner';
import { Search, Pill, PlusCircle, AlertCircle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Medications = () => {
  const [medications, setMedications] = useState(mockMedications);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStockStatusClass = (stock: number, minStock: number) => {
    if (stock <= 0) return "text-red-600 bg-red-50";
    if (stock < minStock) return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };
  
  const getStockStatusText = (stock: number, minStock: number) => {
    if (stock <= 0) return "หมดสต๊อก";
    if (stock < minStock) return "ใกล้หมด";
    return "พร้อมจ่าย";
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ยาและเวชภัณฑ์</h1>
          <p className="text-gray-500">จัดการคลังยาและเวชภัณฑ์</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            เพิ่มรายการยาใหม่
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">รายการยาทั้งหมด</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{medications.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                อัพเดทล่าสุด <span className="font-medium">วันนี้ 08:45 น.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ยาที่ใกล้หมดสต๊อก</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {medications.filter(med => med.stock < med.minStock && med.stock > 0).length}
                </h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ต้องสั่งซื้อภายใน <span className="font-medium text-amber-600">7 วัน</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ยาที่พร้อมจ่าย</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {medications.filter(med => med.stock >= med.minStock).length}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                คิดเป็น <span className="font-medium text-green-600">{Math.round((medications.filter(med => med.stock >= med.minStock).length / medications.length) * 100)}%</span> ของรายการทั้งหมด
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด ({medications.length})</TabsTrigger>
          <TabsTrigger value="low-stock">ใกล้หมดสต๊อก ({medications.filter(med => med.stock < med.minStock && med.stock > 0).length})</TabsTrigger>
          <TabsTrigger value="out-of-stock">หมดสต๊อก ({medications.filter(med => med.stock <= 0).length})</TabsTrigger>
        </TabsList>
        
        <div className="flex mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ค้นหายาและเวชภัณฑ์..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="animate-fade-in">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสยา</TableHead>
                    <TableHead>ชื่อยา</TableHead>
                    <TableHead>หน่วย</TableHead>
                    <TableHead>คงเหลือ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.code}</TableCell>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>{med.unit}</TableCell>
                      <TableCell>{med.stock} {med.unit}</TableCell>
                      <TableCell>
                        <Badge className={getStockStatusClass(med.stock, med.minStock)}>
                          {getStockStatusText(med.stock, med.minStock)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                          แก้ไข
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="low-stock" className="animate-fade-in">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสยา</TableHead>
                    <TableHead>ชื่อยา</TableHead>
                    <TableHead>หน่วย</TableHead>
                    <TableHead>คงเหลือ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedications
                    .filter(med => med.stock < med.minStock && med.stock > 0)
                    .map((med) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.code}</TableCell>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.unit}</TableCell>
                        <TableCell>{med.stock} {med.unit}</TableCell>
                        <TableCell>
                          <Badge className="text-amber-600 bg-amber-50">
                            ใกล้หมด
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                            แก้ไข
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="out-of-stock" className="animate-fade-in">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสยา</TableHead>
                    <TableHead>ชื่อยา</TableHead>
                    <TableHead>หน่วย</TableHead>
                    <TableHead>คงเหลือ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedications
                    .filter(med => med.stock <= 0)
                    .map((med) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.code}</TableCell>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.unit}</TableCell>
                        <TableCell>{med.stock} {med.unit}</TableCell>
                        <TableCell>
                          <Badge className="text-red-600 bg-red-50">
                            หมดสต๊อก
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                            แก้ไข
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Medications;
