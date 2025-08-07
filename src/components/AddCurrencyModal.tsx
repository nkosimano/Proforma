import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { currencyService } from '../services/currencyService';

interface AddCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCurrencies: string[];
  onSuccess: () => void;
}

export default function AddCurrencyModal({ isOpen, onClose, existingCurrencies, onSuccess }: AddCurrencyModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableCurrencies = currencyService.getAvailableCurrencies()
    .filter(currency => !existingCurrencies.includes(currency.code));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurrency) {
      setError('Please select a currency');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await currencyService.addCurrency(selectedCurrency, isDefault);
      if (result) {
        onSuccess();
      } else {
        setError('Failed to add currency');
      }
    } catch (error) {
      console.error('Error adding currency:', error);
      setError(error instanceof Error ? error.message : 'Failed to add currency');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCurrency('');
    setIsDefault(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Currency</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </label>
            <select
              id="currency"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a currency...</option>
              {availableCurrencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Set as default currency
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              The default currency will be used as the base for exchange rate calculations.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedCurrency}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Currency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}