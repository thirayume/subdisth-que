
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface PhoneSearchSectionProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  handlePhoneSearch: () => void;
  isSearching: boolean;
}

const PhoneSearchSection: React.FC<PhoneSearchSectionProps> = ({
  phoneNumber,
  setPhoneNumber,
  handlePhoneSearch,
  isSearching
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
      <div className="flex gap-2">
        <Input
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="กรอกเบอร์โทรศัพท์"
          disabled={isSearching}
        />
        <Button 
          variant="outline" 
          onClick={handlePhoneSearch}
          disabled={isSearching}
          className="px-3"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PhoneSearchSection;
