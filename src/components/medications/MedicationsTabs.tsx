
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Medication } from '@/integrations/supabase/schema';
import MedicationsTable from './MedicationsTable';

interface MedicationsTabsProps {
  medications: Medication[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const MedicationsTabs: React.FC<MedicationsTabsProps> = ({ 
  medications, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">ทั้งหมด ({medications.length})</TabsTrigger>
        <TabsTrigger value="low-stock">
          ใกล้หมดสต๊อก ({medications.filter(med => med.stock < med.min_stock && med.stock > 0).length})
        </TabsTrigger>
        <TabsTrigger value="out-of-stock">
          หมดสต๊อก ({medications.filter(med => med.stock <= 0).length})
        </TabsTrigger>
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
            <MedicationsTable 
              medications={medications} 
              filterText={searchTerm} 
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="low-stock" className="animate-fade-in">
        <Card>
          <CardContent className="p-0">
            <MedicationsTable 
              medications={medications} 
              filterText={searchTerm}
              filterFunction={(med) => med.stock < med.min_stock && med.stock > 0} 
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="out-of-stock" className="animate-fade-in">
        <Card>
          <CardContent className="p-0">
            <MedicationsTable 
              medications={medications} 
              filterText={searchTerm}
              filterFunction={(med) => med.stock <= 0} 
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MedicationsTabs;
