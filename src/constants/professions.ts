export type ProfessionType = 'General' | 'Medical' | 'Legal' | 'Accounting' | 'Engineering';

// Theme mapping for professions
export const PROFESSION_THEMES: Record<ProfessionType, string> = {
  General: 'theme-general',
  Medical: 'theme-medical',
  Legal: 'theme-legal',
  Accounting: 'theme-accounting',
  Engineering: 'theme-engineering'
};

export const PROFESSION_OPTIONS: { value: ProfessionType; label: string }[] = [
  { value: 'General', label: 'General Business' },
  { value: 'Medical', label: 'Medical Practice' },
  { value: 'Legal', label: 'Legal Services' },
  { value: 'Accounting', label: 'Accounting Firm' },
  { value: 'Engineering', label: 'Engineering Services' }
];