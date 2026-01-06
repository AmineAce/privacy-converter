import React from 'react';
import { Shield } from 'lucide-react';

interface AdSpaceProps {
  type: 'vertical' | 'horizontal';
  heading?: string;
  description?: string;
  ctaText?: string;
  linkUrl?: string;
  className?: string;
}

const AdSpace: React.FC<AdSpaceProps> = ({
  type,
  heading = 'Protect Your Digital Life',
  description = 'You secured your images. Now secure your browsing history.',
  ctaText = 'Get Protected',
  linkUrl = '#',
  className
}) => {
  const baseClasses = 'bg-brand-blackest border border-brand-sage/30 rounded-xl p-5 hover:border-brand-neon/50 hover:shadow-lg transition-all';
  const verticalClasses = type === 'vertical' ? 'w-full h-[600px] flex flex-col justify-between' : '';
  const horizontalClasses = type === 'horizontal' ? 'w-full h-[250px] flex flex-col justify-between' : '';

  return (
    <a
      href={linkUrl}
      className={`${baseClasses} ${verticalClasses} ${horizontalClasses} ${className || ''}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-start">
        <Shield className="text-brand-neon mr-2 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold text-white text-md">{heading}</h3>
          <p className="text-xs text-brand-sage mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <span className="bg-brand-sage/20 text-brand-neon text-xs px-3 py-1 rounded inline-block">{ctaText}</span>
      </div>
    </a>
  );
};

export default AdSpace;
