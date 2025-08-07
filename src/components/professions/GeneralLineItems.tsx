import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { LineItem } from '../../types';

interface GeneralLineItemsProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
}

const GeneralLineItems: React.FC<GeneralLineItemsProps> = ({
  items,
  onItemsChange
}) => {
  const [localItems, setLocalItems] = useState<LineItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate amount when quantity or rate changes
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

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    
    const updatedItems = [...localItems, newItem];
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    if (localItems.length > 1) {
      const updatedItems = localItems.filter(item => item.id !== id);
      setLocalItems(updatedItems);
      onItemsChange(updatedItems);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          General Line Items
        </h3>
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Line Item
        </button>
      </div>

      {localItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No line items added yet</p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Line Item
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {localItems.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Line Item #{index + 1}
                </h4>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    rows={2}
                    placeholder="Enter item description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {localItems.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total:</span>
            <span className="text-xl font-bold text-gray-900">
              R {localItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-700 mt-2">
            {localItems.length} line item{localItems.length !== 1 ? 's' : ''} • 
            {localItems.reduce((sum, item) => sum + item.quantity, 0)} total units
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralLineItems;