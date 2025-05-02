import React, { useState } from 'react';
// No need to import a separate CSS file since we're using App.css

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
    <div className="email-consent-container">
      <div className="email-user-profile">
        <div className="email-avatar-placeholder">
          <img src="/images/profile-placeholder.png" alt="Profile" />
        </div>
        <h2>ระบบคิวยา รพสต.</h2>
        <div className="email-tag">
          <span>Messaging API</span>
        </div>
      </div>
      
      <div className="email-consent-form">
        <h3>ขออนุญาตเข้าถึงอีเมล</h3>
        <p>
          เราขออนุญาตเข้าถึงอีเมลของคุณเพื่อ:
        </p>
        <ul>
          <li>สร้างบัญชีผู้ใช้งานในระบบคิวยา</li>
          <li>ส่งการแจ้งเตือนเกี่ยวกับรายการยาและนัดหมาย</li>
          <li>ใช้เป็นช่องทางติดต่อสำรองกรณีไม่สามารถติดต่อผ่าน LINE ได้</li>
        </ul>
        
        <div className="email-consent-checkbox">
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
        
        <div className="email-consent-actions">
          <button 
            className="email-button-submit"
            disabled={!consentGiven}
            onClick={handleSubmit}
          >
            ยืนยัน
          </button>
          <button className="email-button-cancel">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConsentScreen;
