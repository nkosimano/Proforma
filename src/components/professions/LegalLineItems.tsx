import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Scale, Calendar, Clock } from 'lucide-react';
import { LineItem } from '../../types';

interface LegalLineItem extends LineItem {
  caseNumber?: string;
  clientMatter?: string;
  legalMatterType?: string;
  courtReference?: string;
  dateOfService?: string;
  timeSpent?: number;
  hourlyRate?: number;
  attorneyName?: string;
  practiceArea?: string;
  billableActivity?: string;
  courtName?: string;
  opposingParty?: string;
}

interface LegalLineItemsProps {
  items: LegalLineItem[];
  onItemsChange: (items: LegalLineItem[]) => void;
}

const LegalLineItems: React.FC<LegalLineItemsProps> = ({ items, onItemsChange }) => {
  const [localItems, setLocalItems] = useState<LegalLineItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = () => {
    const newItem: LegalLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      caseNumber: '',
      clientMatter: '',
      legalMatterType: '',
      courtReference: '',
      dateOfService: new Date().toISOString().split('T')[0],
      timeSpent: 0,
      hourlyRate: 0,
      attorneyName: '',
      practiceArea: '',
      billableActivity: '',
      courtName: '',
      opposingParty: ''
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

  const updateItem = (id: string, field: keyof LegalLineItem, value: string | number) => {
    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Calculate amount based on time spent and hourly rate for legal services
        if (field === 'timeSpent' || field === 'hourlyRate') {
          const timeSpent = field === 'timeSpent' ? Number(value) : Number(updatedItem.timeSpent);
          const hourlyRate = field === 'hourlyRate' ? Number(value) : Number(updatedItem.hourlyRate);
          updatedItem.amount = timeSpent * hourlyRate;
          updatedItem.rate = hourlyRate;
          updatedItem.quantity = timeSpent;
        } else if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
        }
        return updatedItem;
      }
      return item;
    });
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const legalMatterTypes = [
    'Civil Litigation',
    'Criminal Defense',
    'Corporate Law',
    'Family Law',
    'Property Law',
    'Labour Law',
    'Tax Law',
    'Constitutional Law',
    'Commercial Law',
    'Intellectual Property',
    'Immigration Law',
    'Environmental Law'
  ];

  const practiceAreas = [
    'Litigation',
    'Conveyancing',
    'Corporate Advisory',
    'Mergers & Acquisitions',
    'Employment Law',
    'Debt Collection',
    'Estate Planning',
    'Divorce & Custody',
    'Criminal Defense',
    'Personal Injury',
    'Contract Law',
    'Regulatory Compliance'
  ];

  const billableActivities = [
    'Client Consultation',
    'Legal Research',
    'Document Drafting',
    'Court Appearance',
    'Negotiation',
    'Document Review',
    'Case Preparation',
    'Client Communication',
    'Travel Time',
    'Administrative Work',
    'Expert Consultation',
    'Settlement Conference'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Scale className="h-5 w-5 text-purple-600" />
          Legal Services & Time Entries
        </h3>
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Legal Service
        </button>
      </div>

      {localItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No legal services added yet</p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Legal Service
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {localItems.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-600" />
                  Legal Service #{index + 1}
                </h4>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Case Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-purple-50 rounded-lg">
                <h5 className="col-span-full font-medium text-purple-900 mb-2">Case Information</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Number *
                  </label>
                  <input
                    type="text"
                    value={item.caseNumber || ''}
                    onChange={(e) => updateItem(item.id, 'caseNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter case number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Matter
                  </label>
                  <input
                    type="text"
                    value={item.clientMatter || ''}
                    onChange={(e) => updateItem(item.id, 'clientMatter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief matter description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Matter Type
                  </label>
                  <select
                    value={item.legalMatterType || ''}
                    onChange={(e) => updateItem(item.id, 'legalMatterType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select matter type</option>
                    {legalMatterTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Practice Area
                  </label>
                  <select
                    value={item.practiceArea || ''}
                    onChange={(e) => updateItem(item.id, 'practiceArea', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select practice area</option>
                    {practiceAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Court Reference
                  </label>
                  <input
                    type="text"
                    value={item.courtReference || ''}
                    onChange={(e) => updateItem(item.id, 'courtReference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Court file reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Court Name
                  </label>
                  <input
                    type="text"
                    value={item.courtName || ''}
                    onChange={(e) => updateItem(item.id, 'courtName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., High Court of South Africa"
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="col-span-full font-medium text-blue-900 mb-2">Service Details</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Service *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={item.dateOfService || ''}
                      onChange={(e) => updateItem(item.id, 'dateOfService', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attorney/Advocate Name
                  </label>
                  <input
                    type="text"
                    value={item.attorneyName || ''}
                    onChange={(e) => updateItem(item.id, 'attorneyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Name of attorney/advocate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billable Activity
                  </label>
                  <select
                    value={item.billableActivity || ''}
                    onChange={(e) => updateItem(item.id, 'billableActivity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select activity type</option>
                    {billableActivities.map((activity) => (
                      <option key={activity} value={activity}>{activity}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opposing Party
                  </label>
                  <input
                    type="text"
                    value={item.opposingParty || ''}
                    onChange={(e) => updateItem(item.id, 'opposingParty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Name of opposing party"
                  />
                </div>
              </div>

              {/* Service Description and Time Billing */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Description *
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Detailed description of legal services provided"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time Spent (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={item.timeSpent || 0}
                      onChange={(e) => updateItem(item.id, 'timeSpent', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate (R)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.hourlyRate || 0}
                      onChange={(e) => updateItem(item.id, 'hourlyRate', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units/Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount (R)
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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-purple-900">Total Legal Fees:</span>
            <span className="text-xl font-bold text-purple-900">
              R {localItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-purple-700 mt-1">
            {localItems.length} service{localItems.length !== 1 ? 's' : ''} • 
            {localItems.reduce((sum, item) => sum + (item.timeSpent || 0), 0).toFixed(2)} total hours
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalLineItems;