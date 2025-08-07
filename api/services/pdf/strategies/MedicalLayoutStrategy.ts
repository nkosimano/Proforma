import { IPdfLayoutStrategy, QuoteData } from '../IPdfLayoutStrategy';
import { GeneralLayoutStrategy } from './GeneralLayoutStrategy';

export class MedicalLayoutStrategy extends GeneralLayoutStrategy implements IPdfLayoutStrategy {
  getProfessionType(): string {
    return 'Medical';
  }

  getStyles(): string {
    const baseStyles = super.getStyles();
    return baseStyles + `
      .medical-header {
        background-color: #e8f5e8;
        border-left: 4px solid #28a745;
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .patient-info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
      }
      
      .medical-fields {
        background-color: #fff3cd;
        padding: 8px;
        border-radius: 3px;
        font-size: 11px;
        margin-top: 5px;
      }
      
      .diagnosis-code {
        font-weight: bold;
        color: #856404;
      }
      
      .treatment-type {
        color: #155724;
        font-style: italic;
      }
      
      .medical-disclaimer {
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        padding: 10px;
        margin-top: 20px;
        font-size: 10px;
        color: #0c5460;
      }
    `;
  }

  generateHtml(data: QuoteData): string {
    const styles = this.getStyles();
    const companyInfo = this.generateCompanyInfo(data);
    const medicalHeader = this.generateMedicalHeader();
    const clientInfo = this.generateClientInfo(data);
    const patientInfo = this.generatePatientInfo(data);
    const quoteDetails = this.generateQuoteDetails(data);
    const lineItems = this.generateMedicalLineItems(data);
    const totals = this.generateTotals(data);
    const footer = this.generateMedicalFooter(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Medical Quote ${data.quote_number}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          ${companyInfo}
          ${medicalHeader}
          ${clientInfo}
          ${patientInfo}
          ${quoteDetails}
          ${lineItems}
          ${totals}
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  private generateMedicalHeader(): string {
    return `
      <div class="medical-header">
        <h3 style="margin: 0; color: #28a745;">Medical Services Quote</h3>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Professional medical services and treatment estimate</p>
      </div>
    `;
  }

  private generatePatientInfo(data: QuoteData): string {
    // Extract patient information from line items
    const patientNames = [...new Set(data.line_items
      .filter(item => item.patient_name)
      .map(item => item.patient_name)
    )];

    if (patientNames.length === 0) return '';

    return `
      <div class="patient-info">
        <div class="section-title">Patient Information:</div>
        ${patientNames.map(name => `<div><strong>Patient:</strong> ${name}</div>`).join('')}
      </div>
    `;
  }

  private generateMedicalLineItems(data: QuoteData): string {
    const itemsHtml = data.line_items.map(item => {
      const medicalFields = this.generateMedicalFields(item);
      return `
        <tr>
          <td>
            ${item.description}
            ${medicalFields}
          </td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${this.formatCurrency(item.unit_price, data.currency)}</td>
          <td class="text-right">${this.formatCurrency(item.total, data.currency)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="line-items">
        <div class="section-title">Medical Services & Treatments</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Service Description</th>
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

  private generateMedicalFields(item: {
    patient_name?: string;
    diagnosis_code?: string;
    treatment_type?: string;
    [key: string]: unknown;
  }): string {
    const fields = [];
    
    if (item.patient_name) {
      fields.push(`<strong>Patient:</strong> ${item.patient_name}`);
    }
    
    if (item.diagnosis_code) {
      fields.push(`<span class="diagnosis-code">Diagnosis Code:</span> ${item.diagnosis_code}`);
    }
    
    if (item.treatment_type) {
      fields.push(`<span class="treatment-type">Treatment:</span> ${item.treatment_type}`);
    }

    if (fields.length === 0) return '';

    return `
      <div class="medical-fields">
        ${fields.join(' | ')}
      </div>
    `;
  }

  private generateMedicalFooter(data: QuoteData): string {
    const baseFooter = super.generateFooter(data);
    const disclaimer = `
      <div class="medical-disclaimer">
        <strong>Medical Disclaimer:</strong> This quote is for medical services only. 
        All treatments are subject to medical evaluation and may require additional procedures. 
        Prices may vary based on individual patient needs and insurance coverage. 
        Please consult with your healthcare provider for specific medical advice.
      </div>
    `;
    
    return baseFooter + disclaimer;
  }
}