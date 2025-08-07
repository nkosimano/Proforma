import { IPdfLayoutStrategy, QuoteData } from '../IPdfLayoutStrategy';
import { GeneralLayoutStrategy } from './GeneralLayoutStrategy';

export class LegalLayoutStrategy extends GeneralLayoutStrategy implements IPdfLayoutStrategy {
  getProfessionType(): string {
    return 'Legal';
  }

  getStyles(): string {
    const baseStyles = super.getStyles();
    return baseStyles + `
      .legal-header {
        background-color: #f8f9fa;
        border-left: 4px solid #6c757d;
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .case-info {
        background-color: #e9ecef;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border: 1px solid #dee2e6;
      }
      
      .legal-fields {
        background-color: #fff3cd;
        padding: 8px;
        border-radius: 3px;
        font-size: 11px;
        margin-top: 5px;
        border-left: 3px solid #ffc107;
      }
      
      .case-number {
        font-weight: bold;
        color: #856404;
        font-family: 'Courier New', monospace;
      }
      
      .legal-matter {
        color: #495057;
        font-weight: 600;
      }
      
      .billing-rate {
        color: #28a745;
        font-weight: bold;
      }
      
      .court-reference {
        font-style: italic;
        color: #6c757d;
      }
      
      .legal-disclaimer {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        padding: 10px;
        margin-top: 20px;
        font-size: 10px;
        color: #721c24;
      }
      
      .time-entries {
        font-family: 'Courier New', monospace;
        font-size: 11px;
      }
    `;
  }

  generateHtml(data: QuoteData): string {
    const styles = this.getStyles();
    const companyInfo = this.generateCompanyInfo(data);
    const legalHeader = this.generateLegalHeader();
    const clientInfo = this.generateClientInfo(data);
    const caseInfo = this.generateCaseInfo(data);
    const quoteDetails = this.generateQuoteDetails(data);
    const lineItems = this.generateLegalLineItems(data);
    const totals = this.generateTotals(data);
    const footer = this.generateLegalFooter(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Legal Services Quote ${data.quote_number}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          ${companyInfo}
          ${legalHeader}
          ${clientInfo}
          ${caseInfo}
          ${quoteDetails}
          ${lineItems}
          ${totals}
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  private generateLegalHeader(): string {
    return `
      <div class="legal-header">
        <h3 style="margin: 0; color: #6c757d;">Legal Services Quote</h3>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Professional legal services and consultation estimate</p>
      </div>
    `;
  }

  private generateCaseInfo(data: QuoteData): string {
    // Extract case information from line items
    const caseNumbers = [...new Set(data.line_items
      .filter(item => item.case_number)
      .map(item => item.case_number)
    )];
    
    const legalMatters = [...new Set(data.line_items
      .filter(item => item.legal_matter)
      .map(item => item.legal_matter)
    )];
    
    const courtReferences = [...new Set(data.line_items
      .filter(item => item.court_reference)
      .map(item => item.court_reference)
    )];

    if (caseNumbers.length === 0 && legalMatters.length === 0 && courtReferences.length === 0) {
      return '';
    }

    return `
      <div class="case-info">
        <div class="section-title">Case Information:</div>
        ${caseNumbers.map(caseNum => `<div><strong>Case Number:</strong> <span class="case-number">${caseNum}</span></div>`).join('')}
        ${legalMatters.map(matter => `<div><strong>Legal Matter:</strong> <span class="legal-matter">${matter}</span></div>`).join('')}
        ${courtReferences.map(court => `<div><strong>Court Reference:</strong> <span class="court-reference">${court}</span></div>`).join('')}
      </div>
    `;
  }

  private generateLegalLineItems(data: QuoteData): string {
    const itemsHtml = data.line_items.map(item => {
      const legalFields = this.generateLegalFields(item);
      return `
        <tr>
          <td>
            ${item.description}
            ${legalFields}
          </td>
          <td class="text-right time-entries">${item.quantity}</td>
          <td class="text-right">${this.formatCurrency(item.unit_price, data.currency)}</td>
          <td class="text-right">${this.formatCurrency(item.total, data.currency)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="line-items">
        <div class="section-title">Legal Services & Time Entries</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Service Description</th>
              <th class="text-right">Hours/Units</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  private generateLegalFields(item: {
    case_number?: string;
    legal_matter?: string;
    billing_rate?: number;
    court_reference?: string;
    [key: string]: unknown;
  }): string {
    const fields = [];
    
    if (item.case_number) {
      fields.push(`<span class="case-number">Case:</span> ${item.case_number}`);
    }
    
    if (item.legal_matter) {
      fields.push(`<span class="legal-matter">Matter:</span> ${item.legal_matter}`);
    }
    
    if (item.billing_rate) {
      fields.push(`<span class="billing-rate">Rate:</span> ${this.formatCurrency(item.billing_rate, 'USD')}/hr`);
    }
    
    if (item.court_reference) {
      fields.push(`<span class="court-reference">Court:</span> ${item.court_reference}`);
    }

    if (fields.length === 0) return '';

    return `
      <div class="legal-fields">
        ${fields.join(' | ')}
      </div>
    `;
  }

  private generateLegalFooter(data: QuoteData): string {
    const baseFooter = super.generateFooter(data);
    const disclaimer = `
      <div class="legal-disclaimer">
        <strong>Legal Disclaimer:</strong> This quote is an estimate for legal services only. 
        Actual costs may vary depending on case complexity, court requirements, and time spent. 
        This quote does not constitute legal advice and does not create an attorney-client relationship. 
        All legal services are subject to our standard terms of engagement and retainer agreement.
      </div>
    `;
    
    return baseFooter + disclaimer;
  }
}