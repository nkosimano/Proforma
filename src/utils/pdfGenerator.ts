export interface PDFQuoteData {
  quoteNumber: string;
  date: string;
  validUntil: string;
  profession?: string;
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
    // Profession-specific fields
    [key: string]: unknown;
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
      
      // Build the HTML content using backend service
      const htmlContent = await this.buildQuoteHTML(data);
      container.innerHTML = htmlContent;
      
      // Add to DOM
      document.body.appendChild(container);
  
      
      // Wait for any images to load
      await this.waitForImages(container);
  
      
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

  
      
      // Generate PDF as blob
      const pdfBlob = await (window as Window & {
        html2pdf: () => {
          set: (options: unknown) => {
            from: (element: HTMLElement) => {
              outputPdf: (format: string) => Promise<Blob>;
            };
          };
        };
      }).html2pdf().set(options).from(container).outputPdf('blob');
      
  
      
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

  private static async buildQuoteHTML(data: PDFQuoteData): Promise<string> {
    try {
      // Call the backend PDF generation service
      const response = await fetch('/api/pdf/generate-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profession: data.profession || 'General',
          quoteData: {
            quoteNumber: data.quoteNumber,
            date: data.date,
            validUntil: data.validUntil,
            companyProfile: data.companyProfile,
            clientDetails: data.clientDetails,
            lineItems: data.lineItems.filter(item => item.description.trim() !== ''),
            totals: data.totals,
            terms: data.terms,
            colors: data.colors
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Backend PDF service failed: ${response.status}`);
      }

      const result = await response.json();
      return result.html;
    } catch (error) {
      console.error('Failed to generate HTML from backend service:', error);
      // Fallback to basic HTML structure if backend fails
      return this.buildFallbackHTML(data);
    }
  }

  private static buildFallbackHTML(data: PDFQuoteData): string {
    const validLineItems = data.lineItems.filter(item => item.description.trim() !== '');
    
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1>QUOTATION</h1>
        <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Valid Until:</strong> ${data.validUntil}</p>
        
        <h2>Company Information</h2>
        <p><strong>${data.companyProfile.company_name}</strong></p>
        <p>${data.companyProfile.address.replace(/\n/g, '<br>')}</p>
        <p>Email: ${data.companyProfile.email}</p>
        
        <h2>Client Information</h2>
        <p><strong>${data.clientDetails.name}</strong></p>
        <p>${data.clientDetails.address.replace(/\n/g, '<br>')}</p>
        <p>Email: ${data.clientDetails.email}</p>
        
        ${validLineItems.length > 0 ? `
          <h2>Line Items</h2>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${validLineItems.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>R ${item.unit_price.toFixed(2)}</td>
                  <td>R ${item.line_total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        <h2>Totals</h2>
        <p><strong>Subtotal:</strong> R ${data.totals.subtotal.toFixed(2)}</p>
        ${data.totals.vat > 0 ? `<p><strong>VAT:</strong> R ${data.totals.vat.toFixed(2)}</p>` : ''}
        <p><strong>Total:</strong> R ${data.totals.total.toFixed(2)}</p>
        
        <h2>Terms and Conditions</h2>
        <p>${data.terms}</p>
      </div>
    `;
  }
}