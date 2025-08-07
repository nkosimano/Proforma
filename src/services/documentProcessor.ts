export interface ExtractedQuoteData {
  quote_number?: string;
  invoice_number?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  subtotal?: number;
  vat?: number;
  total?: number;
  date?: string;
  confidence: number;
}

export class DocumentProcessor {
  public static async processDocument(file: File): Promise<ExtractedQuoteData> {
    try {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        throw new Error('Please upload a PDF or image file');
      }

      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Call our backend API that handles Textract
      const response = await fetch('/api/textract/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process document');
      }

      return result.data;
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to process document. Please try again or enter data manually.'
      );
    }
  }
}