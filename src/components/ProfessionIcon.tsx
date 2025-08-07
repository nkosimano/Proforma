import React from 'react';
import { 
  User, 
  Stethoscope, 
  Scale, 
  Calculator, 
  Wrench,
  LucideIcon
} from 'lucide-react';
import { ProfessionType } from '../constants/professions';

interface ProfessionIconProps {
  profession: ProfessionType;
  className?: string;
  size?: number;
}

const PROFESSION_ICONS: Record<ProfessionType, LucideIcon> = {
  General: User,
  Medical: Stethoscope,
  Legal: Scale,
  Accounting: Calculator,
  Engineering: Wrench
};

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

export const getProfessionIcon = (profession: ProfessionType): LucideIcon => {
  return PROFESSION_ICONS[profession];
};

export { PROFESSION_ICONS };