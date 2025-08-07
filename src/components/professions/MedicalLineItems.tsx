import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, User, Calendar, Stethoscope } from 'lucide-react';
import { LineItem } from '../../types';

interface MedicalLineItem extends LineItem {
  patientName?: string;
  patientId?: string;
  diagnosisCode?: string;
  treatmentDate?: string;
  procedureCode?: string;
  medicalAidScheme?: string;
  medicalAidNumber?: string;
  practiceNumber?: string;
  referenceNumber?: string;
}

interface MedicalLineItemsProps {
  items: MedicalLineItem[];
  onItemsChange: (items: MedicalLineItem[]) => void;
}

const MedicalLineItems: React.FC<MedicalLineItemsProps> = ({ items, onItemsChange }) => {
  const [localItems, setLocalItems] = useState<MedicalLineItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = () => {
    const newItem: MedicalLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      patientName: '',
      patientId: '',
      diagnosisCode: '',
      treatmentDate: new Date().toISOString().split('T')[0],
      procedureCode: '',
      medicalAidScheme: '',
      medicalAidNumber: '',
      practiceNumber: '',
      referenceNumber: ''
    };
    const updatedItems = [...localItems, newItem];
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = localItems.filter(item => item.id !== id);
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const updateItem = (id: string, field: keyof MedicalLineItem, value: string | number) => {
    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
        }
        return updatedItem;
      }
      return item;
    });
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const commonDiagnosisCodes = [
    { code: 'Z00.00', description: 'General medical examination' },
    { code: 'Z01.00', description: 'Routine health examination' },
    { code: 'M79.3', description: 'Panniculitis, unspecified' },
    { code: 'R50.9', description: 'Fever, unspecified' },
    { code: 'K59.00', description: 'Constipation, unspecified' }
  ];

  const commonProcedureCodes = [
    { code: '99213', description: 'Office visit - established patient' },
    { code: '99214', description: 'Office visit - detailed examination' },
    { code: '36415', description: 'Venipuncture' },
    { code: '85025', description: 'Complete blood count' },
    { code: '80053', description: 'Comprehensive metabolic panel' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-600" />
          Medical Services & Procedures
        </h3>
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Medical Service
        </button>
      </div>

      {localItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No medical services added yet</p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Medical Service
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {localItems.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Medical Service #{index + 1}
                </h4>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="col-span-full font-medium text-blue-900 mb-2">Patient Information</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={item.patientName || ''}
                    onChange={(e) => updateItem(item.id, 'patientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter patient full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID/Medical Record Number
                  </label>
                  <input
                    type="text"
                    value={item.patientId || ''}
                    onChange={(e) => updateItem(item.id, 'patientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Aid Scheme
                  </label>
                  <input
                    type="text"
                    value={item.medicalAidScheme || ''}
                    onChange={(e) => updateItem(item.id, 'medicalAidScheme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Discovery Health, Momentum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Aid Number
                  </label>
                  <input
                    type="text"
                    value={item.medicalAidNumber || ''}
                    onChange={(e) => updateItem(item.id, 'medicalAidNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter medical aid number"
                  />
                </div>
              </div>

              {/* Medical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
                <h5 className="col-span-full font-medium text-green-900 mb-2">Medical Details</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={item.treatmentDate || ''}
                      onChange={(e) => updateItem(item.id, 'treatmentDate', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Practice Number
                  </label>
                  <input
                    type="text"
                    value={item.practiceNumber || ''}
                    onChange={(e) => updateItem(item.id, 'practiceNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter practice number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diagnosis Code (ICD-10)
                  </label>
                  <select
                    value={item.diagnosisCode || ''}
                    onChange={(e) => updateItem(item.id, 'diagnosisCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select diagnosis code</option>
                    {commonDiagnosisCodes.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.code} - {code.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Procedure Code (CPT)
                  </label>
                  <select
                    value={item.procedureCode || ''}
                    onChange={(e) => updateItem(item.id, 'procedureCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select procedure code</option>
                    {commonProcedureCodes.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.code} - {code.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Description and Billing */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Description *
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the medical service or procedure performed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate (R)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={item.referenceNumber || ''}
                      onChange={(e) => updateItem(item.id, 'referenceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Internal reference"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (R)
                    </label>
                    <input
                      type="number"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {localItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-900">Total Medical Services:</span>
            <span className="text-xl font-bold text-blue-900">
              R {localItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-blue-700 mt-1">
            {localItems.length} service{localItems.length !== 1 ? 's' : ''} • 
            {localItems.reduce((sum, item) => sum + item.quantity, 0)} total units
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalLineItems;