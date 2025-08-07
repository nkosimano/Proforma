export interface PDFQuoteData {
  quoteNumber: string;
  date: string;
  validUntil: string;
  companyProfile: {
    company_name: string;
    address: string;
    email: string;
    phone?: string;
    logo_url?: string;
    company_registration_number?: string;
    tax_number?: string;
  };
  clientDetails: {
    name: string;
    address: string;
    email: string;
    comments?: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  totals: {
    subtotal: number;
    vat: number;
    total: number;
  };
  terms: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface PDFGenerationResult {
  blob: Blob;
  fileName: string;
}

export class PDFGenerator {
  static async generateQuotePDF(data: PDFQuoteData): Promise<void> {
    const result = await this.generateQuotePDFBlob(data);
    this.downloadPDF(result.blob, result.fileName);
  }

  static async generateQuotePDFBlob(data: PDFQuoteData): Promise<PDFGenerationResult> {
    console.log('Starting PDF generation with data:', data);
    
    let container: HTMLElement | null = null;
    
    try {
      // Create a hidden container in the current document
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Segoe UI, system-ui, -apple-system, sans-serif';
      container.style.fontSize = '13px';
      container.style.lineHeight = '1.5';
      container.style.color = '#000';
      container.style.padding = '25mm';
      container.style.boxSizing = 'border-box';
      
      // Build the HTML content
      const htmlContent = this.buildQuoteHTML(data);
      container.innerHTML = htmlContent;
      
      // Add to DOM
      document.body.appendChild(container);
      console.log('Container added to DOM');
      
      // Wait for any images to load
      await this.waitForImages(container);
      console.log('Images loaded');
      
      // Wait a bit more for full rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Configure html2pdf options
      const fileName = `Quote_${data.quoteNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      const options = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true,
          width: 794,
          height: 1123,
          x: 0,
          y: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      console.log('Starting PDF generation...');
      
      // Generate PDF as blob
      const pdfBlob = await (window as any).html2pdf().set(options).from(container).outputPdf('blob');
      
      console.log('PDF generated successfully');
      
      return {
        blob: pdfBlob,
        fileName: fileName
      };
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clean up: remove the container from DOM
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  private static async waitForImages(container: HTMLElement): Promise<void> {
    const images = container.querySelectorAll('img');
    if (images.length === 0) return;

    const imagePromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
          // Timeout after 3 seconds
          setTimeout(() => resolve(), 3000);
        }
      });
    });

    await Promise.all(imagePromises);
  }

  static downloadPDF(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static printPDF(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        URL.revokeObjectURL(url);
      };
    } else {
      URL.revokeObjectURL(url);
    }
  }

  private static buildQuoteHTML(data: PDFQuoteData): string {
    const validLineItems = data.lineItems.filter(item => item.description.trim() !== '');
    console.log('Building HTML for', validLineItems.length, 'line items');
    
    return `
      <style>
        .pdf-container {
          width: 100%;
          max-width: 794px;
          margin: 0 auto;
          background: white;
          color: #2d3748;
          font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid ${data.colors.primary};
          padding-bottom: 25px;
        }
        
        .company-info h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 15px 0;
          letter-spacing: -0.5px;
        }
        
        .company-details {
          color: #4a5568;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 400;
        }
        
        .quote-info {
          text-align: right;
        }
        
        .quote-info h2 {
          font-size: 42px;
          font-weight: 800;
          color: ${data.colors.primary};
          margin: 0 0 20px 0;
          letter-spacing: -1px;
        }
        
        .quote-details {
          background: #f7fafc;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          text-align: left;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .quote-details div {
          margin-bottom: 10px;
          font-size: 12px;
          color: #2d3748;
        }
        
        .quote-details strong {
          font-weight: 600;
          color: #1a202c;
        }
        
        .client-section h3 {
          color: ${data.colors.primary};
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 700;
          border-bottom: 2px solid ${data.colors.primary};
          padding-bottom: 8px;
          letter-spacing: 0.5px;
        }
        
        .client-info {
          background: #f7fafc;
          padding: 25px;
          border-radius: 10px;
          border-left: 5px solid ${data.colors.accent};
          border: 1px solid #e2e8f0;
          margin-bottom: 40px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .client-name {
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 16px;
          color: #1a202c;
        }
        
        .client-info div {
          margin-bottom: 8px;
          color: #4a5568;
          line-height: 1.6;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
          font-size: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .items-table th {
          background: ${data.colors.primary};
          color: white;
          padding: 16px 12px;
          text-align: left;
          border: none;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .items-table th.center { text-align: center; }
        .items-table th.right { text-align: right; }
        
        .items-table td {
          padding: 16px 12px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
          color: #2d3748;
          line-height: 1.5;
        }
        
        .items-table td.center { text-align: center; }
        .items-table td.right { text-align: right; font-weight: 600; }
        
        .items-table tr:nth-child(even) { 
          background: #f7fafc; 
        }
        
        .items-table tr:hover { 
          background: #edf2f7; 
        }
        
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }
        
        .totals-box {
          width: 350px;
          border: 2px solid ${data.colors.accent};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .totals-header {
          background: ${data.colors.primary};
          padding: 16px 20px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .totals-content {
          padding: 20px;
          background: white;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          color: #4a5568;
        }
        
        .totals-row span:last-child {
          font-weight: 600;
          color: #2d3748;
        }
        
        .totals-total {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          font-weight: 800;
          font-size: 18px;
          border-top: 2px solid ${data.colors.accent};
          margin-top: 12px;
          color: #1a202c;
        }
        
        .terms-section h3 {
          color: ${data.colors.primary};
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .terms-content {
          font-size: 11px;
          color: #718096;
          line-height: 1.7;
          white-space: pre-line;
          background: #f7fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 25px;
          font-size: 11px;
          color: #718096;
          line-height: 1.6;
        }
        
        .comments-section {
          margin-bottom: 40px;
        }
        
        .comments-section h3 {
          color: ${data.colors.primary};
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 700;
          border-bottom: 2px solid ${data.colors.accent};
          padding-bottom: 8px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .comments-content {
          background: #f7fafc;
          padding: 25px;
          border-radius: 10px;
          border-left: 5px solid ${data.colors.accent};
          border: 1px solid #e2e8f0;
          line-height: 1.7;
          white-space: pre-line;
          color: #2d3748;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .vat-note {
          text-align: right;
          margin-bottom: 25px;
          font-size: 11px;
          color: #718096;
          font-style: italic;
          font-weight: 500;
        }
      </style>
      
      <div class="pdf-container">
        <div class="header">
          <div class="company-info">
            ${data.companyProfile.logo_url ? `
              <img src="${data.companyProfile.logo_url}" 
                   style="max-height: 70px; max-width: 220px; margin-bottom: 20px; display: block;" 
                   alt="Company Logo" />
            ` : ''}
            <h1>${data.companyProfile.company_name}</h1>
            <div class="company-details">
              <div>${data.companyProfile.address.replace(/\n/g, '<br>')}</div>
              <div>Email: ${data.companyProfile.email}</div>
              ${data.companyProfile.phone ? `<div>Phone: ${data.companyProfile.phone}</div>` : ''}
              ${data.companyProfile.company_registration_number ? `<div>Reg No: ${data.companyProfile.company_registration_number}</div>` : ''}
              ${data.companyProfile.tax_number ? `<div>VAT Reg: ${data.companyProfile.tax_number}</div>` : ''}
            </div>
          </div>
          <div class="quote-info">
            <h2>QUOTATION</h2>
            <div class="quote-details">
              <div><strong>Quote Number:</strong> ${data.quoteNumber}</div>
              <div><strong>Date:</strong> ${data.date}</div>
              <div><strong>Valid Until:</strong> ${data.validUntil}</div>
            </div>
          </div>
        </div>

        <div class="client-section">
          <h3>QUOTATION TO:</h3>
          <div class="client-info">
            <div class="client-name">${data.clientDetails.name}</div>
            <div style="margin-bottom: 10px;">${data.clientDetails.address.replace(/\n/g, '<br>')}</div>
            <div>Email: ${data.clientDetails.email}</div>
          </div>
        </div>

        ${data.lineItems.filter(item => item.description.trim() !== '').length > 0 ? `
          <table class="items-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th class="center" style="width: 80px;">QTY</th>
                <th class="right" style="width: 130px;">UNIT PRICE</th>
                <th class="right" style="width: 130px;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${data.lineItems.filter(item => item.description.trim() !== '').map((item) => `
                <tr>
                  <td>${item.description}</td>
                  <td class="center">${item.quantity}</td>
                  <td class="right">R ${item.unit_price.toFixed(2)}</td>
                  <td class="right"><strong>R ${item.line_total.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="totals-section">
          <div class="totals-box">
            <div class="totals-header">QUOTE SUMMARY</div>
            <div class="totals-content">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>R ${data.totals.subtotal.toFixed(2)}</span>
              </div>
              ${data.totals.vat > 0 ? `
                <div class="totals-row">
                  <span>VAT (15%):</span>
                  <span>R ${data.totals.vat.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="totals-total">
                <span>Total:</span>
                <span>R ${data.totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        ${data.totals.vat === 0 ? `
          <div class="vat-note">
            * VAT Excluded - Not VAT Registered
          </div>
        ` : ''}

        ${data.clientDetails.comments ? `
          <div class="comments-section">
            <h3>ADDITIONAL COMMENTS:</h3>
            <div class="comments-content">${data.clientDetails.comments}</div>
          </div>
        ` : ''}

        <div class="terms-section">
          <h3>TERMS AND CONDITIONS:</h3>
          <div class="terms-content">${data.terms}</div>
        </div>

        <div class="footer">
          <div>Thank you for considering our services. We look forward to working with you.</div>
          <div style="margin-top: 8px;">
            For any questions regarding this quotation, please contact us at ${data.companyProfile.email}
          </div>
        </div>
      </div>
    `;
  }
}