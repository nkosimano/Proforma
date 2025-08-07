import { VercelRequest, VercelResponse } from '@vercel/node';
import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';

// Initialize Textract client
const textractClient = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface ExtractedQuoteData {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, fileName } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ error: 'Missing file data or filename' });
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.status(500).json({ error: 'AWS credentials not configured' });
    }

    // Convert base64 to bytes
    const base64Data = fileData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    const fileBytes = Buffer.from(base64Data, 'base64');

    // Validate file size (max 10MB)
    if (fileBytes.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size must be less than 10MB' });
    }

    // Use AnalyzeDocument for better extraction of forms and tables
    const command = new AnalyzeDocumentCommand({
      Document: {
        Bytes: fileBytes,
      },
      FeatureTypes: ['FORMS', 'TABLES'],
    });

    const response = await textractClient.send(command);
    const extractedData = processTextractResponse(response);

    return res.status(200).json({
      success: true,
      data: extractedData
    });
  } catch (error: any) {
    console.error('Textract processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process document'
    });
  }
}

function processTextractResponse(response: any): ExtractedQuoteData {
  const blocks = response.Blocks || [];
  const textBlocks = blocks.filter((block: any) => block.BlockType === 'LINE');
  
  const text = textBlocks
    .map((block: any) => block.Text)
    .join('\n');
  
  // Calculate average confidence
  const confidences = blocks
    .map((block: any) => block.Confidence || 0)
    .filter((conf: number) => conf > 0);
  
  const avgConfidence = confidences.length > 0 
    ? confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length
    : 0;

  return parseTextToQuoteData(text, avgConfidence);
}

function parseTextToQuoteData(text: string, confidence: number): ExtractedQuoteData {
  const data: ExtractedQuoteData = {
    line_items: [],
    confidence
  };

  // Extract quote/invoice number
  const quoteNumberMatch = text.match(/(?:quote|quotation)\s*#?\s*:?\s*([A-Z0-9-]+)/i);
  if (quoteNumberMatch) {
    data.quote_number = quoteNumberMatch[1];
  }

  const invoiceNumberMatch = text.match(/(?:invoice)\s*#?\s*:?\s*([A-Z0-9-]+)/i);
  if (invoiceNumberMatch) {
    data.invoice_number = invoiceNumberMatch[1];
  }

  // Extract client information
  const clientNameMatch = text.match(/(?:to|client|customer|bill to)\s*:?\s*([^\n]+)/i);
  if (clientNameMatch) {
    data.client_name = clientNameMatch[1].trim();
  }

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) {
    data.client_email = emailMatch[1];
  }

  // Extract date
  const dateMatch = text.match(/(?:date|issued)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
  if (dateMatch) {
    data.date = dateMatch[1];
  }

  // Extract totals
  const totalMatch = text.match(/(?:total|grand total)\s*:?\s*[£$€]?\s*([\d,]+\.?\d*)/i);
  if (totalMatch) {
    data.total = parseFloat(totalMatch[1].replace(/,/g, ''));
  }

  const subtotalMatch = text.match(/(?:subtotal|sub total)\s*:?\s*[£$€]?\s*([\d,]+\.?\d*)/i);
  if (subtotalMatch) {
    data.subtotal = parseFloat(subtotalMatch[1].replace(/,/g, ''));
  }

  const vatMatch = text.match(/(?:vat|tax|gst)\s*:?\s*[£$€]?\s*([\d,]+\.?\d*)/i);
  if (vatMatch) {
    data.vat = parseFloat(vatMatch[1].replace(/,/g, ''));
  }

  // Extract line items (basic pattern matching)
  const lineItemPattern = /([^\n]+?)\s+(\d+)\s+[£$€]?\s*([\d,]+\.?\d*)\s+[£$€]?\s*([\d,]+\.?\d*)/g;
  let match;
  while ((match = lineItemPattern.exec(text)) !== null) {
    const [, description, quantity, unitPrice, lineTotal] = match;
    data.line_items.push({
      description: description.trim(),
      quantity: parseInt(quantity),
      unit_price: parseFloat(unitPrice.replace(/,/g, '')),
      line_total: parseFloat(lineTotal.replace(/,/g, ''))
    });
  }

  // If no line items found, create a basic one from available data
  if (data.line_items.length === 0 && data.total) {
    data.line_items.push({
      description: 'Service/Product',
      quantity: 1,
      unit_price: data.subtotal || data.total,
      line_total: data.subtotal || data.total
    });
  }