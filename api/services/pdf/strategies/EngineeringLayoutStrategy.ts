import { IPdfLayoutStrategy, QuoteData } from '../IPdfLayoutStrategy';
import { GeneralLayoutStrategy } from './GeneralLayoutStrategy';

export class EngineeringLayoutStrategy extends GeneralLayoutStrategy implements IPdfLayoutStrategy {
  getProfessionType(): string {
    return 'Engineering';
  }

  getStyles(): string {
    const baseStyles = super.getStyles();
    return baseStyles + `
      .engineering-header {
        background-color: #fff3e0;
        border-left: 4px solid #ff9800;
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .project-info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border: 1px solid #dee2e6;
      }
      
      .engineering-fields {
        background-color: #fff8e1;
        padding: 8px;
        border-radius: 3px;
        font-size: 11px;
        margin-top: 5px;
        border-left: 3px solid #ff9800;
      }
      
      .project-phase {
        font-weight: bold;
        color: #e65100;
      }
      
      .engineering-discipline {
        color: #bf360c;
        font-weight: 600;
      }
      
      .specification-ref {
        font-family: 'Courier New', monospace;
        color: #424242;
        font-size: 10px;
      }
      
      .engineering-disclaimer {
        background-color: #e8f5e8;
        border: 1px solid #c8e6c9;
        padding: 10px;
        margin-top: 20px;
        font-size: 10px;
        color: #2e7d32;
      }
      
      .technical-summary {
        background-color: #f3e5f5;
        border: 2px solid #9c27b0;
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
      }
      
      .specifications {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        background-color: #fafafa;
        padding: 10px;
        border-radius: 3px;
        margin-top: 10px;
      }
      
      .phase-breakdown {
        background-color: #e3f2fd;
        padding: 10px;
        border-radius: 3px;
        margin-top: 10px;
      }
    `;
  }

  generateHtml(data: QuoteData): string {
    const styles = this.getStyles();
    const companyInfo = this.generateCompanyInfo(data);
    const engineeringHeader = this.generateEngineeringHeader();
    const clientInfo = this.generateClientInfo(data);
    const projectInfo = this.generateProjectInfo(data);
    const quoteDetails = this.generateQuoteDetails(data);
    const lineItems = this.generateEngineeringLineItems(data);
    const totals = this.generateEngineeringTotals(data);
    const footer = this.generateEngineeringFooter(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Engineering Services Quote ${data.quote_number}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          ${companyInfo}
          ${engineeringHeader}
          ${clientInfo}
          ${projectInfo}
          ${quoteDetails}
          ${lineItems}
          ${totals}
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  private generateEngineeringHeader(): string {
    return `
      <div class="engineering-header">
        <h3 style="margin: 0; color: #ff9800;">Engineering Services Quote</h3>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Professional engineering design and consultation services</p>
      </div>
    `;
  }

  private generateProjectInfo(data: QuoteData): string {
    // Extract project information from line items
    const projectPhases = [...new Set(data.line_items
      .filter(item => item.project_phase)
      .map(item => item.project_phase)
    )];
    
    const disciplines = [...new Set(data.line_items
      .filter(item => item.engineering_discipline)
      .map(item => item.engineering_discipline)
    )];
    
    const specifications = [...new Set(data.line_items
      .filter(item => item.specification_reference)
      .map(item => item.specification_reference)
    )];

    if (projectPhases.length === 0 && disciplines.length === 0 && specifications.length === 0) {
      return '';
    }

    return `
      <div class="project-info">
        <div class="section-title">Project Information:</div>
        ${disciplines.length > 0 ? `
          <div><strong>Engineering Disciplines:</strong> ${disciplines.map(disc => `<span class="engineering-discipline">${disc}</span>`).join(', ')}</div>
        ` : ''}
        ${projectPhases.length > 0 ? `
          <div><strong>Project Phases:</strong> ${projectPhases.map(phase => `<span class="project-phase">${phase}</span>`).join(', ')}</div>
        ` : ''}
        ${specifications.length > 0 ? `
          <div class="specifications">
            <strong>Specification References:</strong><br>
            ${specifications.map(spec => `<span class="specification-ref">${spec}</span>`).join('<br>')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateEngineeringLineItems(data: QuoteData): string {
    const itemsHtml = data.line_items.map(item => {
      const engineeringFields = this.generateEngineeringFields(item);
      return `
        <tr>
          <td>
            ${item.description}
            ${engineeringFields}
          </td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${this.formatCurrency(item.unit_price, data.currency)}</td>
          <td class="text-right">${this.formatCurrency(item.total, data.currency)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="line-items">
        <div class="section-title">Engineering Services & Deliverables</div>
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

  private generateEngineeringFields(item: {
    project_phase?: string;
    engineering_discipline?: string;
    specification_reference?: string;
    [key: string]: unknown;
  }): string {
    const fields = [];
    
    if (item.project_phase) {
      fields.push(`<span class="project-phase">Phase:</span> ${item.project_phase}`);
    }
    
    if (item.engineering_discipline) {
      fields.push(`<span class="engineering-discipline">Discipline:</span> ${item.engineering_discipline}`);
    }
    
    if (item.specification_reference) {
      fields.push(`<span class="specification-ref">Spec:</span> ${item.specification_reference}`);
    }

    if (fields.length === 0) return '';

    return `
      <div class="engineering-fields">
        ${fields.join(' | ')}
      </div>
    `;
  }

  private generateEngineeringTotals(data: QuoteData): string {
    const phaseBreakdown = this.generatePhaseBreakdown(data);
    
    return `
      <div class="totals">
        <div class="technical-summary">
          <h4 style="margin: 0 0 10px 0; color: #9c27b0;">Technical Summary</h4>
          <table class="totals-table">
            <tr>
              <td>Engineering Services:</td>
              <td class="text-right">${this.formatCurrency(data.subtotal, data.currency)}</td>
            </tr>
            <tr>
              <td>Applicable Taxes:</td>
              <td class="text-right">${this.formatCurrency(data.tax_amount, data.currency)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Project Cost:</td>
              <td class="text-right">${this.formatCurrency(data.total_amount, data.currency)}</td>
            </tr>
          </table>
          ${phaseBreakdown}
        </div>
      </div>
    `;
  }

  private generatePhaseBreakdown(data: QuoteData): string {
    // Group line items by project phase
    const phaseGroups = data.line_items.reduce((acc, item) => {
      const phase = item.project_phase || 'General';
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(item);
      return acc;
    }, {} as Record<string, Array<{
      total: number;
      project_phase?: string;
      [key: string]: unknown;
    }>>);
    
    const phaseBreakdownHtml = Object.entries(phaseGroups).map(([phase, items]) => {
      const phaseTotal = items.reduce((sum, item) => sum + item.total, 0);
      return `<div><strong>${phase}:</strong> ${this.formatCurrency(phaseTotal, data.currency)} (${items.length} items)</div>`;
    }).join('');
    
    return `
      <div class="phase-breakdown">
        <strong>Project Phase Breakdown:</strong><br>
        ${phaseBreakdownHtml}
      </div>
    `;
  }

  private generateEngineeringFooter(data: QuoteData): string {
    const baseFooter = super.generateFooter(data);
    const disclaimer = `
      <div class="engineering-disclaimer">
        <strong>Engineering Disclaimer:</strong> This quote is for engineering services only. 
        All designs and calculations are preliminary estimates and subject to detailed engineering analysis. 
        Final costs may vary based on site conditions, regulatory requirements, and design changes. 
        All engineering work will be performed in accordance with applicable codes and standards. 
        Professional engineering stamp and approval may be required for certain deliverables.
      </div>
    `;
    
    return baseFooter + disclaimer;
  }
}