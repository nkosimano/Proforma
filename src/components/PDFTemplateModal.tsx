import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { X, Palette, Check } from 'lucide-react';
import { pdfTemplates } from '../constants/pdfTemplates';

interface PDFTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

export const PDFTemplateModal: React.FC<PDFTemplateModalProps> = ({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [localSelectedTemplate, setLocalSelectedTemplate] = useState(selectedTemplate);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSelectedTemplate(selectedTemplate);
  }, [selectedTemplate]);

  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current && contentRef.current) {
      // Animate modal opening
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      
      gsap.fromTo(contentRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
      
      // Animate template cards
      const templateCards = contentRef.current.querySelectorAll('.template-card');
      gsap.fromTo(templateCards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.2,
        ease: 'power2.in'
      });
      
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setLocalSelectedTemplate(templateId);
    
    // Add selection animation
    const selectedCard = document.querySelector(`[data-template-id="${templateId}"]`);
    if (selectedCard) {
      gsap.to(selectedCard, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      });
    }
  };

  const handleApply = () => {
    onTemplateChange(localSelectedTemplate);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div 
        ref={overlayRef}
        className="absolute inset-0"
        onClick={handleClose}
      />
      
      <div 
        ref={contentRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Palette className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">PDF Color Templates</h2>
                <p className="text-sm text-gray-600">Choose a color theme for your PDF quotes</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfTemplates.map((template) => (
              <div
                key={template.id}
                data-template-id={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`template-card relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
                  localSelectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {/* Color Preview */}
                <div className="mb-4 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
                <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                
                {/* Selected Indicator */}
                {localSelectedTemplate === template.id && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                  localSelectedTemplate === template.id 
                    ? 'bg-blue-500/5' 
                    : 'bg-transparent hover:bg-gray-500/5'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Selected: <span className="font-medium text-gray-900">
              {pdfTemplates.find(t => t.id === localSelectedTemplate)?.name || 'None'}
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!localSelectedTemplate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Palette className="w-4 h-4" />
              <span>Apply Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};