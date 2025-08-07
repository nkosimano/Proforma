import { LineItem } from '../../types';

// Define the profession types
export type ProfessionType = 'General' | 'Medical' | 'Legal' | 'Accounting' | 'Engineering';

// Define the component props interface
export interface ProfessionLineItemsProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
}

// Component mapping for dynamic profession-based rendering with lazy loading
export const professionComponentMap = {
  General: () => import('./GeneralLineItems'),
  Medical: () => import('./MedicalLineItems'),
  Legal: () => import('./LegalLineItems'),
  Accounting: () => import('./AccountingLineItems'),
  Engineering: () => import('./EngineeringLineItems'),
} as const;

// Type-safe component getter
export const getProfessionComponent = (profession: ProfessionType) => {
  return professionComponentMap[profession] || professionComponentMap.General;
};

// Profession metadata for UI display
export const professionMetadata = {
  General: {
    name: 'General',
    description: 'Standard line items for general business services',
    color: 'gray',
    icon: 'FileText',
    fields: ['description', 'quantity', 'rate', 'amount'],
  },
  Medical: {
    name: 'Medical',
    description: 'Medical services with patient and treatment information',
    color: 'red',
    icon: 'Heart',
    fields: [
      'description', 'quantity', 'rate', 'amount',
      'patientName', 'patientId', 'diagnosisCode', 'treatmentType',
      'practitionerName', 'medicalAidScheme', 'authorizationNumber'
    ],
  },
  Legal: {
    name: 'Legal',
    description: 'Legal services with case and billing information',
    color: 'purple',
    icon: 'Scale',
    fields: [
      'description', 'quantity', 'rate', 'amount',
      'caseNumber', 'clientName', 'matterType', 'courtReference',
      'practiceArea', 'billingRate', 'timeSpent', 'attendeeNames'
    ],
  },
  Accounting: {
    name: 'Accounting',
    description: 'Accounting entries with financial and tax information',
    color: 'green',
    icon: 'Calculator',
    fields: [
      'description', 'quantity', 'rate', 'amount',
      'accountCode', 'accountName', 'taxCategory', 'vatRate', 'vatAmount',
      'journalReference', 'transactionDate', 'costCenter', 'projectCode'
    ],
  },
  Engineering: {
    name: 'Engineering',
    description: 'Engineering services with technical specifications',
    color: 'blue',
    icon: 'Wrench',
    fields: [
      'description', 'quantity', 'rate', 'amount',
      'projectPhase', 'materialCode', 'laborHours', 'laborRate',
      'materialCost', 'equipmentCost', 'engineeringDiscipline', 'drawingNumber'
    ],
  },
} as const;

// Helper function to get profession list
export const getProfessionList = (): ProfessionType[] => {
  return Object.keys(professionComponentMap) as ProfessionType[];
};

// Helper function to get profession metadata
export const getProfessionMetadata = (profession: ProfessionType) => {
  return professionMetadata[profession] || professionMetadata.General;
};

// Validation helper for profession types
export const isValidProfession = (profession: string): profession is ProfessionType => {
  return profession in professionComponentMap;
};

// Default profession fallback
export const DEFAULT_PROFESSION: ProfessionType = 'General';

// Form field configurations for each profession
export const professionFormConfigs = {
  General: {
    requiredFields: ['description', 'quantity', 'rate'],
    optionalFields: ['amount'],
    validationRules: {
      description: { required: true, minLength: 3 },
      quantity: { required: true, min: 1 },
      rate: { required: true, min: 0 },
    },
  },
  Medical: {
    requiredFields: ['description', 'quantity', 'rate', 'patientName', 'diagnosisCode'],
    optionalFields: ['patientId', 'treatmentType', 'practitionerName', 'medicalAidScheme', 'authorizationNumber'],
    validationRules: {
      description: { required: true, minLength: 5 },
      quantity: { required: true, min: 1 },
      rate: { required: true, min: 0 },
      patientName: { required: true, minLength: 2 },
      diagnosisCode: { required: true, pattern: /^[A-Z]\d{2}(\.\d{1,2})?$/ }, // ICD-10 format
    },
  },
  Legal: {
    requiredFields: ['description', 'quantity', 'rate', 'caseNumber', 'matterType'],
    optionalFields: ['clientName', 'courtReference', 'practiceArea', 'billingRate', 'timeSpent', 'attendeeNames'],
    validationRules: {
      description: { required: true, minLength: 10 },
      quantity: { required: true, min: 1 },
      rate: { required: true, min: 0 },
      caseNumber: { required: true, minLength: 3 },
      matterType: { required: true },
    },
  },
  Accounting: {
    requiredFields: ['description', 'quantity', 'rate', 'accountCode', 'transactionDate'],
    optionalFields: ['accountName', 'taxCategory', 'vatRate', 'journalReference', 'costCenter', 'projectCode'],
    validationRules: {
      description: { required: true, minLength: 5 },
      quantity: { required: true, min: 1 },
      rate: { required: true, min: 0 },
      accountCode: { required: true, pattern: /^\d{4}$/ }, // 4-digit account code
      transactionDate: { required: true },
    },
  },
  Engineering: {
    requiredFields: ['description', 'quantity', 'rate', 'engineeringDiscipline', 'projectPhase'],
    optionalFields: ['materialCode', 'laborHours', 'laborRate', 'materialCost', 'equipmentCost', 'drawingNumber'],
    validationRules: {
      description: { required: true, minLength: 10 },
      quantity: { required: true, min: 1 },
      rate: { required: true, min: 0 },
      engineeringDiscipline: { required: true },
      projectPhase: { required: true },
    },
  },
} as const;

// Helper function to get form configuration
export const getProfessionFormConfig = (profession: ProfessionType) => {
  return professionFormConfigs[profession] || professionFormConfigs.General;
};

// Export types for external use
export type ProfessionComponentMap = typeof professionComponentMap;
export type ProfessionMetadata = typeof professionMetadata;
export type ProfessionFormConfig = typeof professionFormConfigs;