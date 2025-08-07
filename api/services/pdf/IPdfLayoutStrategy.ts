export interface QuoteData {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  client_phone?: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  profession?: string;
  notes?: string;
  terms?: string;
  line_items: LineItem[];
  company_settings?: CompanySettings;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  // Profession-specific fields
  patient_name?: string;
  diagnosis_code?: string;
  treatment_type?: string;
  case_number?: string;
  legal_matter?: string;
  billing_rate?: number;
  court_reference?: string;
  account_code?: string;
  tax_category?: string;
  project_phase?: string;
  engineering_discipline?: string;
  specification_reference?: string;
}

export interface CompanySettings {
  company_name: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_logo?: string;
  tax_number?: string;
  registration_number?: string;
}

/**
 * Interface for PDF layout strategies
 * Each profession can implement its own layout strategy
 */
export interface IPdfLayoutStrategy {
  /**
   * Generate HTML content for the PDF based on quote data
   * @param data - The quote data to generate HTML for
   * @returns HTML string ready for PDF conversion
   */
  generateHtml(data: QuoteData): string;

  /**
   * Get profession-specific CSS styles
   * @returns CSS string for styling the PDF
   */
  getStyles(): string;

  /**
   * Get the profession type this strategy handles
   * @returns The profession type identifier
   */
  getProfessionType(): string;
}