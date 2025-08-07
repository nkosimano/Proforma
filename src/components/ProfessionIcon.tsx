import React from 'react';
import { ProfessionType } from '../constants/professions';
import { PROFESSION_ICONS } from '../utils/professionUtils';

interface ProfessionIconProps {
  profession: ProfessionType;
  className?: string;
  size?: number;
}

export const ProfessionIcon: React.FC<ProfessionIconProps> = ({ 
  profession, 
  className = '',
  size = 20
}) => {
  const IconComponent = PROFESSION_ICONS[profession];
  
  return (
    <IconComponent 
      className={className} 
      size={size}
    />
  );
};