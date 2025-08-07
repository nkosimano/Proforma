export interface PDFTemplate {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient?: string;
  description: string;
}

export const pdfTemplates: PDFTemplate[] = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    primary: '#2563eb',
    secondary: '#1d4ed8',
    accent: '#3b82f6',
    description: 'Professional blue theme'
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    description: 'Fresh green business theme'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#8b5cf6',
    description: 'Elegant purple theme'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    primary: '#ea580c',
    secondary: '#c2410c',
    accent: '#f97316',
    description: 'Vibrant orange theme'
  },
  {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    primary: '#0891b2',
    secondary: '#0e7490',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #164e63 100%)',
    description: 'Ocean blue gradient'
  },
  {
    id: 'forest-gradient',
    name: 'Forest Gradient',
    primary: '#16a34a',
    secondary: '#15803d',
    accent: '#22c55e',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
    description: 'Forest green gradient'
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
    description: 'Warm sunset gradient'
  },
  {
    id: 'midnight-gradient',
    name: 'Midnight Gradient',
    primary: '#4338ca',
    secondary: '#3730a3',
    accent: '#6366f1',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #1e1b4b 100%)',
    description: 'Deep midnight gradient'
  },
  {
    id: 'rose-gradient',
    name: 'Rose Gradient',
    primary: '#e11d48',
    secondary: '#be123c',
    accent: '#f43f5e',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #881337 100%)',
    description: 'Elegant rose gradient'
  },
  {
    id: 'slate-professional',
    name: 'Slate Professional',
    primary: '#475569',
    secondary: '#334155',
    accent: '#64748b',
    description: 'Professional slate gray'
  }
];