import { PdfLayoutFactory } from './pdf/PdfLayoutFactory';
import { QuoteData } from './pdf/IPdfLayoutStrategy';

/**
 * Backend PDF Generator Service
 * Uses the Strategy pattern with Factory for profession-specific layouts
 */
export class PdfGeneratorService {
  /**
   * Generate HTML content for a quote PDF
   * @param quoteData - The quote data to generate PDF for
   * @returns HTML string ready for PDF conversion
   */
  static generateQuoteHtml(quoteData: QuoteData): string {
    try {
      // Get the appropriate layout strategy based on profession
      const profession = quoteData.profession || 'General';
      const layoutStrategy = PdfLayoutFactory.create(profession);
      
      // Generate HTML using the strategy
      const html = layoutStrategy.generateHtml(quoteData);
      
      console.log(`Generated PDF HTML for profession: ${profession}`);
      return html;
      
    } catch (error) {
      console.error('Error generating PDF HTML:', error);
      
      // Fallback to General layout if profession-specific layout fails
      const fallbackStrategy = PdfLayoutFactory.create('General');
      return fallbackStrategy.generateHtml(quoteData);
    }
  }
  
  /**
   * Get available profession types
   * @returns Array of supported profession types
   */
  static getSupportedProfessions(): string[] {
    return PdfLayoutFactory.getSupportedProfessions();
  }
  
  /**
   * Check if a profession is supported
   * @param profession - The profession to check
   * @returns True if supported, false otherwise
   */
  static isProfessionSupported(profession: string): boolean {
    return PdfLayoutFactory.isSupported(profession);
  }
  
  /**
   * Transform quote data from database format to PDF format
   * @param dbQuote - Quote data from database
   * @param companySettings - Company settings from database
   * @returns Formatted quote data for PDF generation
   */
  static transformQuoteData(dbQuote: {
    id: string;
    quote_number: string;
    client_name: string;
    client_email: string;
    client_address: string;
    client_phone?: string;
    issue_date: string;
    due_date: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    currency?: string;
    profession?: string;
    notes?: string;
    terms?: string;
    line_items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;
  }, companySettings: {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_logo?: string;
    tax_number?: string;
    registration_number?: string;
  } | null): QuoteData {
    return {
      id: dbQuote.id,
      quote_number: dbQuote.quote_number,
      client_name: dbQuote.client_name,
      client_email: dbQuote.client_email,
      client_address: dbQuote.client_address,
      client_phone: dbQuote.client_phone,
      issue_date: dbQuote.issue_date,
      due_date: dbQuote.due_date,
      status: dbQuote.status,
      subtotal: dbQuote.subtotal,
      tax_amount: dbQuote.tax_amount,
      total_amount: dbQuote.total_amount,
      currency: dbQuote.currency || 'USD',
      profession: dbQuote.profession || 'General',
      notes: dbQuote.notes,
      terms: dbQuote.terms,
      line_items: dbQuote.line_items || [],
      company_settings: companySettings ? {
        company_name: companySettings.company_name,
        company_address: companySettings.company_address,
        company_phone: companySettings.company_phone,
        company_email: companySettings.company_email,
        company_logo: companySettings.company_logo,
        tax_number: companySettings.tax_number,
        registration_number: companySettings.registration_number
      } : undefined
    };
  }
  
  /**
   * Validate quote data before PDF generation
   * @param quoteData - The quote data to validate
   * @returns Validation result with errors if any
   */
  static validateQuoteData(quoteData: QuoteData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields validation
    if (!quoteData.quote_number) {
      errors.push('Quote number is required');
    }
    
    if (!quoteData.client_name) {
      errors.push('Client name is required');
    }
    
    if (!quoteData.client_email) {
      errors.push('Client email is required');
    }
    
    if (!quoteData.issue_date) {
      errors.push('Issue date is required');
    }
    
    if (!quoteData.due_date) {
      errors.push('Due date is required');
    }
    
    if (!quoteData.line_items || quoteData.line_items.length === 0) {
      errors.push('At least one line item is required');
    }
    
    // Validate line items
    if (quoteData.line_items) {
      quoteData.line_items.forEach((item, index) => {
        if (!item.description || item.description.trim() === '') {
          errors.push(`Line item ${index + 1}: Description is required`);
        }
        
        if (item.quantity <= 0) {
          errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
        }
        
        if (item.unit_price < 0) {
          errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
        }
      });
    }
    
    // Validate totals
    if (quoteData.subtotal < 0) {
      errors.push('Subtotal cannot be negative');
    }
    
    if (quoteData.tax_amount < 0) {
      errors.push('Tax amount cannot be negative');
    }
    
    if (quoteData.total_amount < 0) {
      errors.push('Total amount cannot be negative');
    }
    
    // Validate profession
    if (quoteData.profession && !this.isProfessionSupported(quoteData.profession)) {
      errors.push(`Unsupported profession: ${quoteData.profession}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}