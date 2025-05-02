import React, { useState } from 'react';

const EmailConsentScreen: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  
  const handleConsent = () => {
    setConsentGiven(!consentGiven);
  };
  
  const handleSubmit = () => {
    if (consentGiven) {
      // Proceed with LINE Login with email scope
      console.log('Consent given, proceeding with email scope');
      // Add your LINE Login logic here
    } else {
      // Proceed without email scope
      console.log('Consent not given, proceeding without email scope');
    }
  };
  
  return (
    <div className="consent-container">
      <div className="user-profile">
        <div className="avatar-placeholder">
          <img src="/images/profile-placeholder.png" alt="Profile" />
        </div>
        <h2>ระบบคิวยา รพสต.</h2>
        <div className="tag">
          <span className="tag-text">Messaging API</span>
        </div>
      </div>
      
      <div className="consent-form">
        <h3>ขออนุญาตเข้าถึงอีเมล</h3>
        <p>
          เราขออนุญาตเข้าถึงอีเมลของคุณเพื่อ:
        </p>
        <ul>
          <li>สร้างบัญชีผู้ใช้งานในระบบคิวยา</li>
          <li>ส่งการแจ้งเตือนเกี่ยวกับรายการยาและนัดหมาย</li>
          <li>ใช้เป็นช่องทางติดต่อสำรองกรณีไม่สามารถติดต่อผ่าน LINE ได้</li>
        </ul>
        
        <div className="consent-checkbox">
          <input 
            type="checkbox" 
            id="consent" 
            checked={consentGiven} 
            onChange={handleConsent} 
          />
          <label htmlFor="consent">
            ฉันยินยอมให้แอพนี้เข้าถึงอีเมลของฉัน และเข้าใจว่าข้อมูลจะถูกเก็บรักษาตามนโยบายความเป็นส่วนตัว
          </label>
        </div>
        
        <div className="consent-actions">
          <button 
            className="button-submit"
            disabled={!consentGiven}
            onClick={handleSubmit}
          >
            ยืนยัน
          </button>
          <button className="button-cancel">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConsentScreen;
