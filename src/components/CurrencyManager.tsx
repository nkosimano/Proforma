import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Star, Trash2, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { currencyService } from '../services/currencyService';
import type { Currency } from '../types/database';
import { format } from 'date-fns';
import AddCurrencyModal from './AddCurrencyModal';
import CurrencyConverterModal from './CurrencyConverterModal';

export default function CurrencyManager() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConverterModal, setShowConverterModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateResult, setUpdateResult] = useState<{ updated: number; errors: string[] } | null>(null);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const data = await currencyService.getCurrencies();
      setCurrencies(data);
      
      // Check if we need to initialize default currencies
      if (data.length === 0) {
        await currencyService.initializeDefaultCurrencies();
        const newData = await currencyService.getCurrencies();
        setCurrencies(newData);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExchangeRates = async () => {
    setUpdating(true);
    setUpdateResult(null);
    
    try {
      const result = await currencyService.updateAllExchangeRates();
      setUpdateResult(result);
      setLastUpdate(new Date());
      await loadCurrencies();
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      setUpdateResult({ updated: 0, errors: ['Failed to update exchange rates'] });
    } finally {
      setUpdating(false);
    }
  };

  const handleSetDefault = async (currencyId: string) => {
    setProcessing(currencyId);
    try {
      const success = await currencyService.setDefaultCurrency(currencyId);
      if (success) {
        await loadCurrencies();
      }
    } catch (error) {
      console.error('Error setting default currency:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveCurrency = async (currencyId: string, currencyCode: string) => {
    if (!confirm(`Are you sure you want to remove ${currencyCode}? This action cannot be undone.`)) {
      return;
    }

    setProcessing(currencyId);
    try {
      const success = await currencyService.removeCurrency(currencyId);
      if (success) {
        await loadCurrencies();
      }
    } catch (error) {
      console.error('Error removing currency:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getLastUpdateText = () => {
    if (!lastUpdate) return 'Never updated';
    return `Last updated: ${format(lastUpdate, 'MMM dd, yyyy HH:mm')}`;
  };

  const defaultCurrency = currencies.find(c => c.is_default);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Currency Management</h1>
              <p className="mt-2 text-gray-600">Manage currencies and exchange rates for your business</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConverterModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Currency Converter
              </button>
              <button
                onClick={handleUpdateExchangeRates}
                disabled={updating}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${updating ? 'animate-spin' : ''}`} />
                Update Rates
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Currency
              </button>
            </div>
          </div>
        </div>

        {/* Update Result */}
        {updateResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            updateResult.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center">
              {updateResult.errors.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              )}
              <div>
                <p className={`font-medium ${
                  updateResult.errors.length > 0 ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  Exchange rates update completed
                </p>
                <p className={`text-sm ${
                  updateResult.errors.length > 0 ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {updateResult.updated} currencies updated successfully
                  {updateResult.errors.length > 0 && `, ${updateResult.errors.length} errors`}
                </p>
                {updateResult.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    {updateResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{currencies.length}</h3>
                <p className="text-gray-600">Active Currencies</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {defaultCurrency?.code || 'None'}
                </h3>
                <p className="text-gray-600">Default Currency</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currencies.filter(c => !c.is_default).length}
                </h3>
                <p className="text-gray-600">Foreign Currencies</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xs font-semibold text-gray-900">
                  {getLastUpdateText()}
                </h3>
                <p className="text-gray-600">Exchange Rates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Currencies List */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Active Currencies</h2>
          </div>

          {currencies.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No currencies configured</h3>
              <p className="text-gray-600 mb-4">Add your first currency to get started with multi-currency support.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Currency
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exchange Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currencies.map((currency) => (
                    <tr key={currency.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {currency.symbol}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {currency.code}
                            </div>
                            <div className="text-sm text-gray-500">
                              {currency.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currency.is_default ? (
                          <span className="text-blue-600 font-medium">1.00 (Base)</span>
                        ) : (
                          <span>{currency.exchange_rate.toFixed(4)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currency.last_updated ? (
                          format(new Date(currency.last_updated), 'MMM dd, yyyy HH:mm')
                        ) : (
                          'Never'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currency.is_default ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!currency.is_default && (
                            <button
                              onClick={() => handleSetDefault(currency.id)}
                              disabled={processing === currency.id}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Set as Default"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          
                          {!currency.is_default && (
                            <button
                              onClick={() => handleRemoveCurrency(currency.id, currency.code)}
                              disabled={processing === currency.id}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Remove Currency"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Currency Modal */}
        {showAddModal && (
          <AddCurrencyModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            existingCurrencies={currencies.map(c => c.code)}
            onSuccess={() => {
              setShowAddModal(false);
              loadCurrencies();
            }}
          />
        )}

        {/* Currency Converter Modal */}
        {showConverterModal && (
          <CurrencyConverterModal
            isOpen={showConverterModal}
            onClose={() => setShowConverterModal(false)}
            currencies={currencies}
          />
        )}
      </div>
    </div>
  );
}