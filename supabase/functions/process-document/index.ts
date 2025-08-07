import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TextractResponse {
  Blocks: Array<{
    BlockType: string;
    Text?: string;
    Confidence?: number;
    Geometry?: any;
    Relationships?: Array<{
      Type: string;
      Ids: string[];
    }>;
    Id?: string;
  }>;
}

interface ExtractedData {
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

async function callTextract(base64Data: string): Promise<TextractResponse> {
  const AWS_ACCESS_KEY = Deno.env.get('AWS_ACCESS_KEY_ID');
  const AWS_SECRET_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';

  if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
    throw new Error('AWS credentials not configured');
  }

  // Convert base64 to bytes
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

  const payload = {
    Document: {
      Bytes: Array.from(binaryData)
    },
    FeatureTypes: ['TABLES', 'FORMS']
  };

  // AWS Signature V4 implementation (simplified)
  const service = 'textract';
  const method = 'POST';
  const endpoint = `https://textract.${AWS_REGION}.amazonaws.com/`;
  
  const headers = {
    'Content-Type': 'application/x-amz-json-1.1',
    'X-Amz-Target': 'Textract.AnalyzeDocument',
    'Authorization': `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY}/${new Date().toISOString().slice(0, 10)}/${AWS_REGION}/${service}/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=placeholder`
  };

  const response = await fetch(endpoint, {
    method,
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Textract API error: ${response.status}`);
  }

  return await response.json();
}

function parseTextractResponse(textractData: TextractResponse): ExtractedData {
  const blocks = textractData.Blocks || [];
  const textBlocks = blocks.filter(block => block.BlockType === 'LINE' && block.Text);
  const allText = textBlocks.map(block => block.Text).join('\n');

  let extractedData: ExtractedData = {
    line_items: [],
    confidence: 0.8
  };

  // Extract quote/invoice number
  const quoteNumberRegex = /(quote|quotation|invoice|inv|qu)[\s#-]*(\w*\d+)/i;
  const quoteMatch = allText.match(quoteNumberRegex);
  if (quoteMatch) {
    const fullMatch = quoteMatch[0].trim();
    if (fullMatch.toLowerCase().includes('quote')) {
      extractedData.quote_number = fullMatch;
    } else {
      extractedData.invoice_number = fullMatch;
    }
  }

  // Extract client name (look for patterns after "To:", "Bill To:", etc.)
  const clientPatterns = [
    /(?:to:|bill\s+to:|client:|customer:|quotation\s+to:)\s*([^\n]+)/i,
    /(?:^|\n)([A-Z][a-zA-Z\s&.,'-]+(?:pty|ltd|inc|corp|company|cc|close corporation)?)\s*(?:\n|$)/m
  ];
  
  for (const pattern of clientPatterns) {
    const match = allText.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      extractedData.client_name = match[1].trim();
      break;
    }
  }

  // Extract email addresses
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emails = allText.match(emailRegex);
  if (emails && emails.length > 0) {
    // Try to identify client email vs company email
    const clientEmail = emails.find(email => 
      !email.includes('gmail.com') && 
      !email.includes('outlook.com') && 
      !email.includes('yahoo.com')
    ) || emails[0];
    extractedData.client_email = clientEmail;
  }

  // Extract address (look for multi-line address patterns)
  const addressRegex = /(\d+[^,\n]*(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|place|pl)[^,\n]*(?:,\s*[^,\n]+)*)/i;
  const addressMatch = allText.match(addressRegex);
  if (addressMatch) {
    extractedData.client_address = addressMatch[1].trim();
  }

  // Extract monetary amounts
  const amountRegex = /r\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
  const amounts = [];
  let match;
  while ((match = amountRegex.exec(allText)) !== null) {
    amounts.push(parseFloat(match[1].replace(/,/g, '')));
  }

  // Extract totals (look for specific patterns)
  const totalRegex = /(?:total|amount\s+due)[\s:]*r?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
  const totalMatch = allText.match(totalRegex);
  if (totalMatch) {
    extractedData.total = parseFloat(totalMatch[1].replace(/,/g, ''));
  }

  const subtotalRegex = /(?:subtotal|sub-total)[\s:]*r?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
  const subtotalMatch = allText.match(subtotalRegex);
  if (subtotalMatch) {
    extractedData.subtotal = parseFloat(subtotalMatch[1].replace(/,/g, ''));
  }

  const vatRegex = /(?:vat|tax)[\s:]*r?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
  const vatMatch = allText.match(vatRegex);
  if (vatMatch) {
    extractedData.vat = parseFloat(vatMatch[1].replace(/,/g, ''));
  }

  // Extract line items from table data
  const tableBlocks = blocks.filter(block => block.BlockType === 'TABLE');
  if (tableBlocks.length > 0) {
    // Process table data to extract line items
    // This is a simplified version - in production you'd use the full table structure
    const lineItemRegex = /(\d+)\s+([^0-9\r\n]+?)\s+r?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s+r?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
    let lineMatch;
    while ((lineMatch = lineItemRegex.exec(allText)) !== null) {
      const quantity = parseInt(lineMatch[1]);
      const description = lineMatch[2].trim();
      const unit_price = parseFloat(lineMatch[3].replace(/,/g, ''));
      const line_total = parseFloat(lineMatch[4].replace(/,/g, ''));

      if (description && quantity > 0) {
        extractedData.line_items.push({
          description,
          quantity,
          unit_price,
          line_total
        });
      }
    }
  }

  // If no line items found, try to extract from amounts
  if (extractedData.line_items.length === 0 && amounts.length > 0) {
    // Create a generic line item with the largest amount
    const maxAmount = Math.max(...amounts);
    extractedData.line_items.push({
      description: 'Extracted service/product',
      quantity: 1,
      unit_price: maxAmount,
      line_total: maxAmount
    });
  }

  // Extract date
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const dateMatch = allText.match(dateRegex);
  if (dateMatch) {
    extractedData.date = dateMatch[1];
  }

  // Calculate confidence based on extracted fields
  let confidence = 0.3;
  if (extractedData.quote_number || extractedData.invoice_number) confidence += 0.2;
  if (extractedData.client_name) confidence += 0.2;
  if (extractedData.total) confidence += 0.2;
  if (extractedData.line_items.length > 0) confidence += 0.1;
  
  extractedData.confidence = Math.min(confidence, 1.0);

  return extractedData;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();
    
    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'No file data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove data URL prefix if present
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');

    // Call Amazon Textract
    const textractResponse = await callTextract(base64Data);
    
    // Parse the response
    const extractedData = parseTextractResponse(textractResponse);

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        fileName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process document',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});