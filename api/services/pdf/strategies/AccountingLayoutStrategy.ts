import { IPdfLayoutStrategy, QuoteData } from '../IPdfLayoutStrategy';
import { GeneralLayoutStrategy } from './GeneralLayoutStrategy';

export class AccountingLayoutStrategy extends GeneralLayoutStrategy implements IPdfLayoutStrategy {
  getProfessionType(): string {
    return 'Accounting';
  }

  getStyles(): string {
    const baseStyles = super.getStyles();
    return baseStyles + `
      .accounting-header {
        background-color: #e8f4fd;
        border-left: 4px solid #007bff;
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .account-info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border: 1px solid #dee2e6;
      }
      
      .accounting-fields {
        background-color: #e7f3ff;
        padding: 8px;
        border-radius: 3px;
        font-size: 11px;
        margin-top: 5px;
        border-left: 3px solid #007bff;
      }
      
      .account-code {
        font-weight: bold;
        color: #0056b3;
        font-family: 'Courier New', monospace;
      }
      
      .tax-category {
        color: #28a745;
        font-weight: 600;
      }
      
      .financial-period {
        color: #6c757d;
        font-style: italic;
      }
      
      .accounting-disclaimer {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        padding: 10px;
        margin-top: 20px;
        font-size: 10px;
        color: #155724;
      }
      
      .financial-summary {
        background-color: #f8f9fa;
        border: 2px solid #007bff;
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
      }
      
      .chart-of-accounts {
        font-family: 'Courier New', monospace;
        font-size: 11px;
      }
      
      .tax-breakdown {
        background-color: #fff3cd;
        padding: 10px;
        border-radius: 3px;
        margin-top: 10px;
      }
    `;
  }

  generateHtml(data: QuoteData): string {
    const styles = this.getStyles();
    const companyInfo = this.generateCompanyInfo(data);
    const accountingHeader = this.generateAccountingHeader();
    const clientInfo = this.generateClientInfo(data);
    const accountInfo = this.generateAccountInfo(data);
    const quoteDetails = this.generateQuoteDetails(data);
    const lineItems = this.generateAccountingLineItems(data);
    const totals = this.generateAccountingTotals(data);
    const footer = this.generateAccountingFooter(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Accounting Services Quote ${data.quote_number}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          ${companyInfo}
          ${accountingHeader}
          ${clientInfo}
          ${accountInfo}
          ${quoteDetails}
          ${lineItems}
          ${totals}
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  private generateAccountingHeader(): string {
    return `
      <div class="accounting-header">
        <h3 style="margin: 0; color: #007bff;">Accounting Services Quote</h3>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Professional accounting and financial services estimate</p>
      </div>
    `;
  }

  private generateAccountInfo(data: QuoteData): string {
    // Extract account information from line items
    const accountCodes = [...new Set(data.line_items
      .filter(item => item.account_code)
      .map(item => item.account_code)
    )];
    
    const taxCategories = [...new Set(data.line_items
      .filter(item => item.tax_category)
      .map(item => item.tax_category)
    )];

    if (accountCodes.length === 0 && taxCategories.length === 0) {
      return '';
    }

    return `
      <div class="account-info">
        <div class="section-title">Account Information:</div>
        ${accountCodes.length > 0 ? `
          <div><strong>Account Codes:</strong> ${accountCodes.map(code => `<span class="account-code">${code}</span>`).join(', ')}</div>
        ` : ''}
        ${taxCategories.length > 0 ? `
          <div><strong>Tax Categories:</strong> ${taxCategories.map(cat => `<span class="tax-category">${cat}</span>`).join(', ')}</div>
        ` : ''}
        <div class="financial-period"><strong>Financial Period:</strong> ${new Date(data.issue_date).getFullYear()}</div>
      </div>
    `;
  }

  private generateAccountingLineItems(data: QuoteData): string {
    const itemsHtml = data.line_items.map(item => {
      const accountingFields = this.generateAccountingFields(item);
      return `
        <tr>
          <td>
            ${item.description}
            ${accountingFields}
          </td>
          <td class="text-right chart-of-accounts">${item.quantity}</td>
          <td class="text-right">${this.formatCurrency(item.unit_price, data.currency)}</td>
          <td class="text-right">${this.formatCurrency(item.total, data.currency)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="line-items">
        <div class="section-title">Accounting Services & Transactions</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Service Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  private generateAccountingFields(item: {
    account_code?: string;
    tax_category?: string;
    [key: string]: unknown;
  }): string {
    const fields = [];
    
    if (item.account_code) {
      fields.push(`<span class="account-code">Account:</span> ${item.account_code}`);
    }
    
    if (item.tax_category) {
      fields.push(`<span class="tax-category">Tax Category:</span> ${item.tax_category}`);
    }

    if (fields.length === 0) return '';

    return `
      <div class="accounting-fields">
        ${fields.join(' | ')}
      </div>
    `;
  }

  private generateAccountingTotals(data: QuoteData): string {
    const taxBreakdown = this.generateTaxBreakdown(data);
    
    return `
      <div class="totals">
        <div class="financial-summary">
          <h4 style="margin: 0 0 10px 0; color: #007bff;">Financial Summary</h4>
          <table class="totals-table">
            <tr>
              <td>Subtotal (Pre-Tax):</td>
              <td class="text-right">${this.formatCurrency(data.subtotal, data.currency)}</td>
            </tr>
            <tr>
              <td>Tax Amount:</td>
              <td class="text-right">${this.formatCurrency(data.tax_amount, data.currency)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount:</td>
              <td class="text-right">${this.formatCurrency(data.total_amount, data.currency)}</td>
            </tr>
          </table>
          ${taxBreakdown}
        </div>
      </div>
    `;
  }

  private generateTaxBreakdown(data: QuoteData): string {
    // Calculate tax rate percentage
    const taxRate = data.subtotal > 0 ? (data.tax_amount / data.subtotal * 100).toFixed(2) : '0.00';
    
    return `
      <div class="tax-breakdown">
        <strong>Tax Breakdown:</strong><br>
        Tax Rate: ${taxRate}% | Tax Base: ${this.formatCurrency(data.subtotal, data.currency)} | Tax Amount: ${this.formatCurrency(data.tax_amount, data.currency)}
      </div>
    `;
  }

  private generateAccountingFooter(data: QuoteData): string {
    const baseFooter = super.generateFooter(data);
    const disclaimer = `
      <div class="accounting-disclaimer">
        <strong>Accounting Disclaimer:</strong> This quote is for accounting services only. 
        All financial calculations are estimates and subject to verification. 
        Final amounts may vary based on actual transactions and regulatory requirements. 
        This quote does not constitute financial advice. Please consult with a qualified accountant 
        for specific financial guidance and tax implications.
      </div>
    `;
    
    return baseFooter + disclaimer;
  }
}