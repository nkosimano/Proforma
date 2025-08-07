import React from 'react';
import { Palette } from 'lucide-react';

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

interface PDFTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

export const PDFTemplateSelector: React.FC<PDFTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Palette className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">PDF Color Template</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Choose a color theme for your PDF quotes that matches your business branding
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pdfTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Color Preview */}
            <div className="mb-3 h-16 rounded-lg overflow-hidden border border-gray-200">
              {template.gradient ? (
                <div
                  style={{ background: template.gradient }}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex h-full">
                  <div
                    style={{ backgroundColor: template.primary }}
                    className="flex-1"
                  />
                  <div
                    style={{ backgroundColor: template.secondary }}
                    className="flex-1"
                  />
                  <div
                    style={{ backgroundColor: template.accent }}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
            
            {/* Template Info */}
            <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
            <p className="text-xs text-gray-600">{template.description}</p>
            
            {/* Selected Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};