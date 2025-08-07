import { IPdfLayoutStrategy, QuoteData } from '../IPdfLayoutStrategy';

export class GeneralLayoutStrategy implements IPdfLayoutStrategy {
  getProfessionType(): string {
    return 'General';
  }

  generateHtml(data: QuoteData): string {
    const styles = this.getStyles();
    const companyInfo = this.generateCompanyInfo(data);
    const clientInfo = this.generateClientInfo(data);
    const quoteDetails = this.generateQuoteDetails(data);
    const lineItems = this.generateLineItems(data);
    const totals = this.generateTotals(data);
    const footer = this.generateFooter(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quote ${data.quote_number}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          ${companyInfo}
          ${clientInfo}
          ${quoteDetails}
          ${lineItems}
          ${totals}
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  getStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        border-bottom: 2px solid #007bff;
        padding-bottom: 20px;
      }
      
      .company-info {
        flex: 1;
      }
      
      .company-name {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        margin-bottom: 10px;
      }
      
      .quote-title {
        text-align: right;
        flex: 1;
      }
      
      .quote-number {
        font-size: 20px;
        font-weight: bold;
        color: #007bff;
      }
      
      .client-section {
        margin-bottom: 30px;
      }
      
      .section-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #007bff;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }
      
      .quote-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .details-column {
        flex: 1;
      }
      
      .line-items {
        margin-bottom: 30px;
      }
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      .items-table th,
      .items-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      
      .items-table th {
        background-color: #f8f9fa;
        font-weight: bold;
        color: #007bff;
      }
      
      .items-table .text-right {
        text-align: right;
      }
      
      .totals {
        margin-left: auto;
        width: 300px;
        margin-bottom: 30px;
      }
      
      .totals-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .totals-table td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
      }
      
      .totals-table .total-row {
        font-weight: bold;
        font-size: 14px;
        background-color: #f8f9fa;
      }
      
      .footer {
        border-top: 1px solid #ddd;
        padding-top: 20px;
        margin-top: 30px;
      }
      
      .notes {
        margin-bottom: 20px;
      }
      
      .terms {
        font-size: 10px;
        color: #666;
      }
    `;
  }

  protected generateCompanyInfo(data: QuoteData): string {
    const company = data.company_settings;
    if (!company) return '';

    return `
      <div class="header">
        <div class="company-info">
          <div class="company-name">${company.company_name}</div>
          ${company.company_address ? `<div>${company.company_address}</div>` : ''}
          ${company.company_phone ? `<div>Phone: ${company.company_phone}</div>` : ''}
          ${company.company_email ? `<div>Email: ${company.company_email}</div>` : ''}
          ${company.tax_number ? `<div>Tax Number: ${company.tax_number}</div>` : ''}
        </div>
        <div class="quote-title">
          <div class="quote-number">QUOTE #${data.quote_number}</div>
        </div>
      </div>
    `;
  }

  protected generateClientInfo(data: QuoteData): string {
    return `
      <div class="client-section">
        <div class="section-title">Bill To:</div>
        <div><strong>${data.client_name}</strong></div>
        ${data.client_email ? `<div>${data.client_email}</div>` : ''}
        ${data.client_address ? `<div>${data.client_address}</div>` : ''}
        ${data.client_phone ? `<div>${data.client_phone}</div>` : ''}
      </div>
    `;
  }

  protected generateQuoteDetails(data: QuoteData): string {
    return `
      <div class="quote-details">
        <div class="details-column">
          <div><strong>Issue Date:</strong> ${new Date(data.issue_date).toLocaleDateString()}</div>
          <div><strong>Due Date:</strong> ${new Date(data.due_date).toLocaleDateString()}</div>
        </div>
        <div class="details-column">
          <div><strong>Status:</strong> ${data.status}</div>
          <div><strong>Currency:</strong> ${data.currency}</div>
        </div>
      </div>
    `;
  }

  protected generateLineItems(data: QuoteData): string {
    const itemsHtml = data.line_items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">${this.formatCurrency(item.unit_price, data.currency)}</td>
        <td class="text-right">${this.formatCurrency(item.total, data.currency)}</td>
      </tr>
    `).join('');

    return `
      <div class="line-items">
        <div class="section-title">Items</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
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

  protected generateTotals(data: QuoteData): string {
    return `
      <div class="totals">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">${this.formatCurrency(data.subtotal, data.currency)}</td>
          </tr>
          <tr>
            <td>Tax:</td>
            <td class="text-right">${this.formatCurrency(data.tax_amount, data.currency)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td class="text-right">${this.formatCurrency(data.total_amount, data.currency)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  protected generateFooter(data: QuoteData): string {
    return `
      <div class="footer">
        ${data.notes ? `
          <div class="notes">
            <div class="section-title">Notes</div>
            <div>${data.notes}</div>
          </div>
        ` : ''}
        ${data.terms ? `
          <div class="terms">
            <div class="section-title">Terms & Conditions</div>
            <div>${data.terms}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  protected formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }
}