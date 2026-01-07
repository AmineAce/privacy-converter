import React from 'react';

interface AdSpaceProps {
  imageSrc: string;
  linkUrl: string;
  className?: string;
}

const AdSpace: React.FC<AdSpaceProps> = ({
  imageSrc,
  linkUrl,
  className
}) => {
  return (
    <a
      href={linkUrl}
      className={`block hover:scale-[1.02] transition-transform ${className || ''}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={imageSrc} alt="" className="w-full h-auto shadow-md" />
    </a>
  );
};

export default AdSpace;
