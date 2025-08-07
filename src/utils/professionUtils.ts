import { 
  User, 
  Stethoscope, 
  Scale, 
  Calculator, 
  Wrench,
  LucideIcon
} from 'lucide-react';
import { ProfessionType } from '../constants/professions';

export const PROFESSION_ICONS: Record<ProfessionType, LucideIcon> = {
  General: User,
  Medical: Stethoscope,
  Legal: Scale,
  Accounting: Calculator,
  Engineering: Wrench
};

export const getProfessionIcon = (profession: ProfessionType): LucideIcon => {
  return PROFESSION_ICONS[profession];
};