import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, X, Zap, Brain } from 'lucide-react';
import { DocumentProcessor, ExtractedQuoteData } from '../services/documentProcessor';

interface DocumentUploadProps {
  onDataExtracted: (data: ExtractedQuoteData) => void;
  onClose: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDataExtracted, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setProcessing(true);
    setError(null);
    setProcessingStep('Uploading document...');

    try {
      setProcessingStep('Analyzing document with AI...');
      const extractedData = await DocumentProcessor.processDocument(file);
      
      setProcessingStep('Extracting data fields...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX
      
      setProcessingStep('Complete!');
      onDataExtracted(extractedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
      setProcessingStep('');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">AI Document Processing</h2>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {!processing ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Document</h3>
                <p className="text-gray-600 mb-4">
                  Upload a PDF quote or invoice and our AI will automatically extract all the data for you.
                  Supports quotes from any accounting system or manually created documents.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Powered by Amazon Textract</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Professional-grade AI that automatically identifies and extracts:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                        <li>Quote/Invoice numbers and dates</li>
                        <li>Client information and contact details</li>
                        <li>Line items with descriptions, quantities, and prices</li>
                        <li>Subtotals, VAT, and total amounts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-4 ${
                    dragActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Upload className={`h-8 w-8 ${
                      dragActive ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {dragActive ? 'Drop your file here' : 'Drag & drop your document'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    Supports PDF and image files up to 10MB
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Processing Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <Brain className="h-6 w-6 text-blue-600 absolute top-5 left-1/2 transform -translate-x-1/2" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
              <p className="text-gray-600 mb-4">
                Our AI is analyzing your document and extracting the data...
              </p>
              {processingStep && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
                  <p className="text-sm text-blue-800 font-medium">{processingStep}</p>
                </div>
              )}
              <div className="mt-6 text-xs text-gray-500">
                This usually takes 10-30 seconds depending on document complexity
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};