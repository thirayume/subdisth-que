
import React from 'react';

const SidebarFooter: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
      &copy; {new Date().getFullYear()} Pharmacy Queue System
    </div>
  );
};

export default SidebarFooter;
