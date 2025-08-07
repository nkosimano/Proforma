import { ProfessionType } from './professions';

// General terminology mappings
export const GENERAL_TERMINOLOGY = {
  quote: 'Create Quote',
  invoices: 'Invoices',
  customers: 'Customers',
  appName: 'QuotePro'
};

// Profession-specific terminology mappings
export const PROFESSION_TERMINOLOGY: Record<ProfessionType, {
  quote: string;
  invoices: string;
  customers: string;
  appName: string;
}> = {
  General: GENERAL_TERMINOLOGY,
  Medical: {
    quote: 'Create Estimate',
    invoices: 'Bills',
    customers: 'Patients',
    appName: 'MedicalPro'
  },
  Legal: {
    quote: 'Pro Forma',
    invoices: 'Bills',
    customers: 'Clients',
    appName: 'LegalPro'
  },
  Accounting: {
    quote: 'Create Estimate',
    invoices: 'Invoices',
    customers: 'Clients',
    appName: 'AccountPro'
  },
  Engineering: {
    quote: 'Project Quote',
    invoices: 'Invoices',
    customers: 'Clients',
    appName: 'EngineerPro'
  }
};