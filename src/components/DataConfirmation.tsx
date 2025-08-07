import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Edit3, Save, X } from 'lucide-react';
import { ExtractedQuoteData } from '../services/documentProcessor';
import type { LineItem, ClientDetails, QuoteTotals } from '../types';

interface DataConfirmationProps {
  extractedData: ExtractedQuoteData;
  onConfirm: (confirmedData: {
    clientDetails: Omit<ClientDetails, 'user_id'>;
    lineItems: LineItem[];
    totals: QuoteTotals;
    comments: string;
  }) => void;
  onCancel: () => void;
}

export const DataConfirmation: React.FC<DataConfirmationProps> = ({
  extractedData,
  onConfirm,
  onCancel
}) => {
  const [editing, setEditing] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    name: extractedData.client_name || '',
    address: extractedData.client_address || '',
    email: extractedData.client_email || '',
  });
  const [lineItems, setLineItems] = useState<LineItem[]>(
    extractedData.line_items.map((item, index) => ({
      id: (index + 1).toString(),
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total
    }))
  );
  const [totals, setTotals] = useState({
    subtotal: extractedData.subtotal || 0,
    vat: extractedData.vat || 0,
    total: extractedData.total || 0
  });

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.line_total = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const recalculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    const vat = subtotal * 0.15; // 15% VAT
    const total = subtotal + vat;
    setTotals({ subtotal, vat, total });
  };

  const handleConfirm = () => {
    onConfirm({
      clientDetails,
      lineItems,
      totals,
      comments: `Imported from ${extractedData.quote_number || extractedData.invoice_number || 'document'} on ${new Date().toLocaleDateString()}`
    });
  };

  const confidenceColor = extractedData.confidence >= 0.8 ? 'text-green-600' : 
                         extractedData.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';
  const confidenceIcon = extractedData.confidence >= 0.8 ? CheckCircle : AlertTriangle;
  const ConfidenceIcon = confidenceIcon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Confirm Extracted Data</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ConfidenceIcon className={`h-5 w-5 mr-2 ${confidenceColor}`} />
              <span className={`text-sm font-medium ${confidenceColor}`}>
                {Math.round(extractedData.confidence * 100)}% confidence
              </span>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">Document Processed Successfully!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Review the extracted data below and make any necessary corrections before importing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Info */}
          {(extractedData.quote_number || extractedData.invoice_number) && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Document Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {extractedData.quote_number && (
                  <div>
                    <span className="text-blue-700 font-medium">Quote Number:</span>
                    <span className="ml-2 text-blue-800">{extractedData.quote_number}</span>
                  </div>
                )}
                {extractedData.invoice_number && (
                  <div>
                    <span className="text-blue-700 font-medium">Invoice Number:</span>
                    <span className="ml-2 text-blue-800">{extractedData.invoice_number}</span>
                  </div>
                )}
                {extractedData.date && (
                  <div>
                    <span className="text-blue-700 font-medium">Date:</span>
                    <span className="ml-2 text-blue-800">{extractedData.date}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Client Details */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Client Details</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                {editing ? 'Done Editing' : 'Edit'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={clientDetails.name}
                    onChange={(e) => setClientDetails({...clientDetails, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    {clientDetails.name || 'Not detected'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={clientDetails.email}
                    onChange={(e) => setClientDetails({...clientDetails, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    {clientDetails.email || 'Not detected'}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {editing ? (
                  <textarea
                    value={clientDetails.address}
                    onChange={(e) => setClientDetails({...clientDetails, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg min-h-[80px]">
                    {clientDetails.address || 'Not detected'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Line Items ({lineItems.length} detected)
              </h3>
              {editing && (
                <button
                  onClick={recalculateTotals}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Recalculate Totals
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{item.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editing ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editing ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">R {item.unit_price.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">R {item.line_total.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Totals</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">R {totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.vat > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700">VAT (15%):</span>
                      <span className="font-medium">R {totals.vat.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t border-gray-300 text-lg font-bold">
                    <span>Total:</span>
                    <span>R {totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Indicator */}
          <div className="mb-6">
            <div className={`p-4 rounded-lg border ${
              extractedData.confidence >= 0.8 
                ? 'bg-green-50 border-green-200' 
                : extractedData.confidence >= 0.6 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                <ConfidenceIcon className={`h-5 w-5 mr-2 ${confidenceColor}`} />
                <div>
                  <h4 className={`text-sm font-medium ${confidenceColor.replace('text-', 'text-').replace('-600', '-900')}`}>
                    Extraction Confidence: {Math.round(extractedData.confidence * 100)}%
                  </h4>
                  <p className={`text-sm mt-1 ${confidenceColor.replace('-600', '-700')}`}>
                    {extractedData.confidence >= 0.8 
                      ? 'High confidence - data looks accurate'
                      : extractedData.confidence >= 0.6 
                      ? 'Medium confidence - please review the data carefully'
                      : 'Low confidence - please verify all extracted data'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!clientDetails.name || !clientDetails.email || !clientDetails.address}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};