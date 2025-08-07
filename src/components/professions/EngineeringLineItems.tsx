import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wrench, Clock } from 'lucide-react';
import { LineItem } from '../../types';

interface EngineeringLineItem extends LineItem {
  projectPhase?: string;
  materialCode?: string;
  materialSpecification?: string;
  laborHours?: number;
  laborRate?: number;
  materialCost?: number;
  equipmentCost?: number;
  engineeringDiscipline?: string;
  drawingNumber?: string;
  revisionNumber?: string;
  workPackage?: string;
  milestone?: string;
  qualityStandard?: string;
  safetyRequirement?: string;
  environmentalImpact?: string;
  testingRequired?: boolean;
  certificationNeeded?: string;
  deliverable?: string;
  riskLevel?: string;
  complexity?: string;
}

interface EngineeringLineItemsProps {
  items: EngineeringLineItem[];
  onItemsChange: (items: EngineeringLineItem[]) => void;
}

const EngineeringLineItems: React.FC<EngineeringLineItemsProps> = ({ items, onItemsChange }) => {
  const [localItems, setLocalItems] = useState<EngineeringLineItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = () => {
    const newItem: EngineeringLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      projectPhase: '',
      materialCode: '',
      materialSpecification: '',
      laborHours: 0,
      laborRate: 0,
      materialCost: 0,
      equipmentCost: 0,
      engineeringDiscipline: '',
      drawingNumber: '',
      revisionNumber: 'Rev 0',
      workPackage: '',
      milestone: '',
      qualityStandard: '',
      safetyRequirement: '',
      environmentalImpact: '',
      testingRequired: false,
      certificationNeeded: '',
      deliverable: '',
      riskLevel: 'Low',
      complexity: 'Standard'
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

  const updateItem = (id: string, field: keyof EngineeringLineItem, value: string | number | boolean) => {
    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate total cost based on labor, material, and equipment costs
        if (field === 'laborHours' || field === 'laborRate' || field === 'materialCost' || field === 'equipmentCost') {
          const laborCost = Number(updatedItem.laborHours) * Number(updatedItem.laborRate);
          const materialCost = Number(updatedItem.materialCost) || 0;
          const equipmentCost = Number(updatedItem.equipmentCost) || 0;
          const totalCost = laborCost + materialCost + equipmentCost;
          updatedItem.rate = totalCost;
          updatedItem.amount = Number(updatedItem.quantity) * totalCost;
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

  const engineeringDisciplines = [
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Structural Engineering',
    'Environmental Engineering',
    'Geotechnical Engineering',
    'Transportation Engineering',
    'Water Resources Engineering',
    'Software Engineering',
    'Systems Engineering',
    'Industrial Engineering',
    'Aerospace Engineering',
    'Materials Engineering',
    'Mining Engineering'
  ];

  const projectPhases = [
    'Conceptual Design',
    'Preliminary Design',
    'Detailed Design',
    'Engineering Analysis',
    'Procurement',
    'Construction',
    'Testing & Commissioning',
    'Operations & Maintenance',
    'Decommissioning'
  ];

  const qualityStandards = [
    'ISO 9001',
    'ISO 14001',
    'SANS 10400',
    'SANS 10160',
    'SANS 50001',
    'ASME Standards',
    'IEEE Standards',
    'API Standards',
    'ASTM Standards',
    'BS Standards',
    'EN Standards',
    'NEMA Standards'
  ];

  const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  const complexityLevels = ['Simple', 'Standard', 'Complex', 'Highly Complex'];

  const milestones = [
    'Design Freeze',
    'Prototype Complete',
    'Testing Complete',
    'Approval Received',
    'Manufacturing Ready',
    'Installation Complete',
    'Commissioning Complete',
    'Handover Complete'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-600" />
          Engineering Services & Technical Specifications
        </h3>
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Engineering Item
        </button>
      </div>

      {localItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No engineering items added yet</p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Engineering Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {localItems.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  Engineering Item #{index + 1}
                </h4>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="col-span-full font-medium text-blue-900 mb-2">Project Information</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engineering Discipline *
                  </label>
                  <select
                    value={item.engineeringDiscipline || ''}
                    onChange={(e) => updateItem(item.id, 'engineeringDiscipline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select discipline</option>
                    {engineeringDisciplines.map((discipline) => (
                      <option key={discipline} value={discipline}>{discipline}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Phase
                  </label>
                  <select
                    value={item.projectPhase || ''}
                    onChange={(e) => updateItem(item.id, 'projectPhase', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select project phase</option>
                    {projectPhases.map((phase) => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Package
                  </label>
                  <input
                    type="text"
                    value={item.workPackage || ''}
                    onChange={(e) => updateItem(item.id, 'workPackage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Work package identifier"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Milestone
                  </label>
                  <select
                    value={item.milestone || ''}
                    onChange={(e) => updateItem(item.id, 'milestone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select milestone</option>
                    {milestones.map((milestone) => (
                      <option key={milestone} value={milestone}>{milestone}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
                <h5 className="col-span-full font-medium text-green-900 mb-2">Technical Specifications</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drawing Number
                  </label>
                  <input
                    type="text"
                    value={item.drawingNumber || ''}
                    onChange={(e) => updateItem(item.id, 'drawingNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Drawing/plan number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revision Number
                  </label>
                  <input
                    type="text"
                    value={item.revisionNumber || ''}
                    onChange={(e) => updateItem(item.id, 'revisionNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rev 0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Code
                  </label>
                  <input
                    type="text"
                    value={item.materialCode || ''}
                    onChange={(e) => updateItem(item.id, 'materialCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Material/component code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Standard
                  </label>
                  <select
                    value={item.qualityStandard || ''}
                    onChange={(e) => updateItem(item.id, 'qualityStandard', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select quality standard</option>
                    {qualityStandards.map((standard) => (
                      <option key={standard} value={standard}>{standard}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Specification
                  </label>
                  <textarea
                    value={item.materialSpecification || ''}
                    onChange={(e) => updateItem(item.id, 'materialSpecification', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Detailed material specifications and requirements"
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-yellow-50 rounded-lg">
                <h5 className="col-span-full font-medium text-yellow-900 mb-2">Cost Breakdown</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labor Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.laborHours || 0}
                      onChange={(e) => updateItem(item.id, 'laborHours', Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labor Rate (R/hour)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.laborRate || 0}
                    onChange={(e) => updateItem(item.id, 'laborRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labor Cost (R)
                  </label>
                  <input
                    type="number"
                    value={((item.laborHours || 0) * (item.laborRate || 0)).toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Cost (R)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.materialCost || 0}
                    onChange={(e) => updateItem(item.id, 'materialCost', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Cost (R)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.equipmentCost || 0}
                    onChange={(e) => updateItem(item.id, 'equipmentCost', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Unit Cost (R)
                  </label>
                  <input
                    type="number"
                    value={item.rate.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-semibold"
                  />
                </div>
              </div>

              {/* Risk & Compliance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-red-50 rounded-lg">
                <h5 className="col-span-full font-medium text-red-900 mb-2">Risk & Compliance</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Level
                  </label>
                  <select
                    value={item.riskLevel || ''}
                    onChange={(e) => updateItem(item.id, 'riskLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {riskLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complexity Level
                  </label>
                  <select
                    value={item.complexity || ''}
                    onChange={(e) => updateItem(item.id, 'complexity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {complexityLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Safety Requirement
                  </label>
                  <input
                    type="text"
                    value={item.safetyRequirement || ''}
                    onChange={(e) => updateItem(item.id, 'safetyRequirement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Safety standards and requirements"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environmental Impact
                  </label>
                  <input
                    type="text"
                    value={item.environmentalImpact || ''}
                    onChange={(e) => updateItem(item.id, 'environmentalImpact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Environmental considerations"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Needed
                  </label>
                  <input
                    type="text"
                    value={item.certificationNeeded || ''}
                    onChange={(e) => updateItem(item.id, 'certificationNeeded', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Required certifications"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`testing-${item.id}`}
                    checked={item.testingRequired || false}
                    onChange={(e) => updateItem(item.id, 'testingRequired', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`testing-${item.id}`} className="ml-2 block text-sm text-gray-700">
                    Testing Required
                  </label>
                </div>
              </div>

              {/* Service Description and Deliverable */}
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
                    placeholder="Detailed description of engineering service or deliverable"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deliverable
                  </label>
                  <input
                    type="text"
                    value={item.deliverable || ''}
                    onChange={(e) => updateItem(item.id, 'deliverable', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Expected deliverable (drawings, reports, calculations, etc.)"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Rate (R)
                    </label>
                    <input
                      type="number"
                      value={item.rate.toFixed(2)}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {localItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">Total Labor Hours:</span>
              <span className="text-lg font-bold text-blue-900">
                {localItems.reduce((sum, item) => sum + (item.laborHours || 0), 0).toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">Material Costs:</span>
              <span className="text-lg font-bold text-blue-900">
                R {localItems.reduce((sum, item) => sum + (item.materialCost || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">Equipment Costs:</span>
              <span className="text-lg font-bold text-blue-900">
                R {localItems.reduce((sum, item) => sum + (item.equipmentCost || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">Grand Total:</span>
              <span className="text-xl font-bold text-blue-900">
                R {localItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-sm text-blue-700 mt-2">
            {localItems.length} engineering item{localItems.length !== 1 ? 's' : ''} • 
            {localItems.reduce((sum, item) => sum + item.quantity, 0)} total units • 
            {localItems.filter(item => item.testingRequired).length} requiring testing
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineeringLineItems;