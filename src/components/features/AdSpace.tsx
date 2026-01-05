import React from 'react';

interface AdSpaceProps {
  type: 'vertical' | 'horizontal';
  className?: string;
}

const AdSpace: React.FC<AdSpaceProps> = ({ type, className }) => {
  const baseClasses = 'bg-red-900/80 border-2 border-red-500 flex items-center justify-center text-white font-medium';
  const verticalClasses = type === 'vertical' ? 'w-[300px] h-[600px]' : '';
  const horizontalClasses = type === 'horizontal' ? 'w-full h-[250px]' : '';

  return (
    <div className={`${baseClasses} ${verticalClasses} ${horizontalClasses} ${className || ''}`}>
      Ad Space
    </div>
  );
};

export default AdSpace;
