
import React, { useEffect } from 'react';
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
  // Add useEffect to log every render
  useEffect(() => {
    console.log('----------------------------------------');
    console.log('🔍 PHONE SEARCH SECTION RENDERED');
    console.log(`Current phone number: "${phoneNumber}"`);
    console.log(`isSearching: ${isSearching}`);
    console.log('----------------------------------------');
  }, [phoneNumber, isSearching]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`🔍 [PhoneSearchSection] Phone number input changed: ${e.target.value}`);
    setPhoneNumber(e.target.value);
  };
  
  const handleSearchClick = () => {
    console.log('🔍 [PhoneSearchSection] Search button clicked');
    console.log(`Searching for phone number: ${phoneNumber}`);
    handlePhoneSearch();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('🔍 [PhoneSearchSection] Enter key pressed in phone input');
      console.log(`Searching for phone number: ${phoneNumber}`);
      e.preventDefault();
      handlePhoneSearch();
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
      <div className="flex gap-2">
        <Input
          id="phoneNumber"
          value={phoneNumber}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="กรอกเบอร์โทรศัพท์"
          disabled={isSearching}
        />
        <Button 
          variant="outline" 
          onClick={handleSearchClick}
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
