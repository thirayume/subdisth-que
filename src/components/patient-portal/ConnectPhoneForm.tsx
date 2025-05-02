// src/components/patient-portal/ConnectPhoneForm.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ConnectPhoneForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  
  // Get LINE profile from location state
  const { lineId, displayName } = location.state || {};
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    
    // Store phone number with LINE token
    localStorage.setItem('userPhone', phone);
    
    // Call your handleLineLoginSuccess function
    toast.success('เชื่อมต่อบัญชีสำเร็จ');
    
    // Navigate back to patient portal
    navigate('/patient-portal');
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>เชื่อมต่อบัญชี LINE</h2>
      <p>สวัสดี {displayName}</p>
      <p>กรุณากรอกเบอร์โทรศัพท์เพื่อเชื่อมต่อกับบัญชี LINE ของคุณ</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>
            เบอร์โทรศัพท์
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812345678"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          style={{
            backgroundColor: '#06C755',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            width: '100%',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          เชื่อมต่อบัญชี
        </button>
      </form>
    </div>
  );
};

export default ConnectPhoneForm;