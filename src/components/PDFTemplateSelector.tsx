import React from 'react';
import { Palette } from 'lucide-react';
import { pdfTemplates } from '../constants/pdfTemplates';

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