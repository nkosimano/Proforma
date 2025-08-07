import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Calculator, Calendar } from 'lucide-react';
import { LineItem } from '../../types';

interface AccountingLineItem extends LineItem {
  accountCode?: string;
  accountName?: string;
  taxCategory?: string;
  vatRate?: number;
  vatAmount?: number;
  journalReference?: string;
  transactionDate?: string;
  costCenter?: string;
  projectCode?: string;
  expenseCategory?: string;
  debitAccount?: string;
  creditAccount?: string;
  reconciliationRef?: string;
  auditTrail?: string;
}

interface AccountingLineItemsProps {
  items: AccountingLineItem[];
  onItemsChange: (items: AccountingLineItem[]) => void;
}

const AccountingLineItems: React.FC<AccountingLineItemsProps> = ({ items, onItemsChange }) => {
  const [localItems, setLocalItems] = useState<AccountingLineItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = () => {
    const newItem: AccountingLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      accountCode: '',
      accountName: '',
      taxCategory: 'Standard',
      vatRate: 15,
      vatAmount: 0,
      journalReference: '',
      transactionDate: new Date().toISOString().split('T')[0],
      costCenter: '',
      projectCode: '',
      expenseCategory: '',
      debitAccount: '',
      creditAccount: '',
      reconciliationRef: '',
      auditTrail: ''
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

  const updateItem = (id: string, field: keyof AccountingLineItem, value: string | number) => {
    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate VAT amount when rate or VAT rate changes
        if (field === 'rate' || field === 'vatRate' || field === 'quantity') {
          const baseAmount = Number(updatedItem.quantity) * Number(updatedItem.rate);
          const vatRate = Number(updatedItem.vatRate) || 0;
          updatedItem.vatAmount = (baseAmount * vatRate) / 100;
          updatedItem.amount = baseAmount + updatedItem.vatAmount;
        } else if (field === 'amount') {
          updatedItem.amount = Number(value);
        }
        
        return updatedItem;
      }
      return item;
    });
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const accountCodes = [
    { code: '1000', name: 'Cash and Cash Equivalents' },
    { code: '1100', name: 'Accounts Receivable' },
    { code: '1200', name: 'Inventory' },
    { code: '1300', name: 'Prepaid Expenses' },
    { code: '1500', name: 'Property, Plant & Equipment' },
    { code: '2000', name: 'Accounts Payable' },
    { code: '2100', name: 'Accrued Liabilities' },
    { code: '2200', name: 'Short-term Debt' },
    { code: '3000', name: 'Share Capital' },
    { code: '3100', name: 'Retained Earnings' },
    { code: '4000', name: 'Revenue' },
    { code: '5000', name: 'Cost of Goods Sold' },
    { code: '6000', name: 'Operating Expenses' },
    { code: '7000', name: 'Other Income' },
    { code: '8000', name: 'Other Expenses' }
  ];

  const taxCategories = [
    'Standard (15%)',
    'Zero Rated (0%)',
    'Exempt',
    'Input VAT',
    'Output VAT',
    'Withholding Tax',
    'PAYE',
    'UIF',
    'SDL'
  ];

  const expenseCategories = [
    'Professional Services',
    'Office Expenses',
    'Travel & Entertainment',
    'Marketing & Advertising',
    'Utilities',
    'Insurance',
    'Depreciation',
    'Interest Expense',
    'Bank Charges',
    'Legal & Professional',
    'Repairs & Maintenance',
    'Rent & Lease'
  ];

  const costCenters = [
    'Administration',
    'Sales & Marketing',
    'Operations',
    'Finance',
    'Human Resources',
    'IT Department',
    'Research & Development',
    'Customer Service'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          Accounting Entries & Financial Records
        </h3>
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Accounting Entry
        </button>
      </div>

      {localItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No accounting entries added yet</p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Accounting Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {localItems.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600" />
                  Accounting Entry #{index + 1}
                </h4>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
                <h5 className="col-span-full font-medium text-green-900 mb-2">Account Information</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Code *
                  </label>
                  <select
                    value={item.accountCode || ''}
                    onChange={(e) => {
                      const selectedAccount = accountCodes.find(acc => acc.code === e.target.value);
                      updateItem(item.id, 'accountCode', e.target.value);
                      if (selectedAccount) {
                        updateItem(item.id, 'accountName', selectedAccount.name);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select account code</option>
                    {accountCodes.map((account) => (
                      <option key={account.code} value={account.code}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={item.accountName || ''}
                    onChange={(e) => updateItem(item.id, 'accountName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Account name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Debit Account
                  </label>
                  <input
                    type="text"
                    value={item.debitAccount || ''}
                    onChange={(e) => updateItem(item.id, 'debitAccount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Debit account code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Account
                  </label>
                  <input
                    type="text"
                    value={item.creditAccount || ''}
                    onChange={(e) => updateItem(item.id, 'creditAccount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Credit account code"
                  />
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="col-span-full font-medium text-blue-900 mb-2">Transaction Details</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={item.transactionDate || ''}
                      onChange={(e) => updateItem(item.id, 'transactionDate', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Journal Reference
                  </label>
                  <input
                    type="text"
                    value={item.journalReference || ''}
                    onChange={(e) => updateItem(item.id, 'journalReference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Journal entry reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Center
                  </label>
                  <select
                    value={item.costCenter || ''}
                    onChange={(e) => updateItem(item.id, 'costCenter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select cost center</option>
                    {costCenters.map((center) => (
                      <option key={center} value={center}>{center}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Code
                  </label>
                  <input
                    type="text"
                    value={item.projectCode || ''}
                    onChange={(e) => updateItem(item.id, 'projectCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Project/job code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Category
                  </label>
                  <select
                    value={item.expenseCategory || ''}
                    onChange={(e) => updateItem(item.id, 'expenseCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select expense category</option>
                    {expenseCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reconciliation Reference
                  </label>
                  <input
                    type="text"
                    value={item.reconciliationRef || ''}
                    onChange={(e) => updateItem(item.id, 'reconciliationRef', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Bank/reconciliation ref"
                  />
                </div>
              </div>

              {/* Tax Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-yellow-50 rounded-lg">
                <h5 className="col-span-full font-medium text-yellow-900 mb-2">Tax Information</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Category
                  </label>
                  <select
                    value={item.taxCategory || ''}
                    onChange={(e) => updateItem(item.id, 'taxCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select tax category</option>
                    {taxCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.vatRate || 0}
                    onChange={(e) => updateItem(item.id, 'vatRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Amount (R)
                  </label>
                  <input
                    type="number"
                    value={(item.vatAmount || 0).toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>
              </div>

              {/* Entry Description and Amount */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Description *
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Detailed description of the accounting entry"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Rate (R)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtotal (R)
                    </label>
                    <input
                      type="number"
                      value={(item.quantity * item.rate).toFixed(2)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT (R)
                    </label>
                    <input
                      type="number"
                      value={(item.vatAmount || 0).toFixed(2)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audit Trail Notes
                  </label>
                  <input
                    type="text"
                    value={item.auditTrail || ''}
                    onChange={(e) => updateItem(item.id, 'auditTrail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Additional notes for audit trail"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {localItems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-green-900">Subtotal:</span>
              <span className="text-lg font-bold text-green-900">
                R {localItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-green-900">Total VAT:</span>
              <span className="text-lg font-bold text-green-900">
                R {localItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-green-900">Grand Total:</span>
              <span className="text-xl font-bold text-green-900">
                R {localItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-sm text-green-700 mt-2">
            {localItems.length} accounting entr{localItems.length !== 1 ? 'ies' : 'y'} • 
            {localItems.reduce((sum, item) => sum + item.quantity, 0)} total units
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingLineItems;