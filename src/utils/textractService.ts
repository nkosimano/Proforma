import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand, DetectDocumentTextResponse, AnalyzeDocumentResponse, Block } from '@aws-sdk/client-textract';

// Initialize Textract client
const textractClient = new TextractClient({
  region: import.meta.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  },
});

export interface TextractResult {
  text: string;
  confidence: number;
  blocks?: Block[];
}

export interface TextractError {
  message: string;
  code?: string;
}

/**
 * Extract text from a document using Amazon Textract
 * @param file - The file to process
 * @param useAdvancedAnalysis - Whether to use advanced document analysis (forms, tables)
 * @returns Promise with extracted text and confidence score
 */
export async function extractTextFromDocument(
  file: File,
  useAdvancedAnalysis: boolean = false
): Promise<TextractResult> {
  try {
    // Convert file to bytes
    const fileBytes = await fileToBytes(file);
    
    if (useAdvancedAnalysis) {
      // Use AnalyzeDocument for forms and tables
      const command = new AnalyzeDocumentCommand({
        Document: {
          Bytes: fileBytes,
        },
        FeatureTypes: ['FORMS', 'TABLES'],
      });
      
      const response = await textractClient.send(command);
      return processAnalyzeDocumentResponse(response);
    } else {
      // Use DetectDocumentText for simple text extraction
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: fileBytes,
        },
      });
      
      const response = await textractClient.send(command);
      return processDetectDocumentTextResponse(response);
    }
  } catch (error: unknown) {
    console.error('Textract error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract text from document';
    const errorCode = error instanceof Error ? error.name : 'TEXTRACT_ERROR';
    throw {
      message: errorMessage,
      code: errorCode,
    } as TextractError;
  }
}

/**
 * Convert File object to Uint8Array
 */
async function fileToBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Process response from DetectDocumentText
 */
function processDetectDocumentTextResponse(response: DetectDocumentTextResponse): TextractResult {
  const blocks = response.Blocks || [];
  const textBlocks = blocks.filter((block: Block) => block.BlockType === 'LINE');
  
  const text = textBlocks
    .map((block: Block) => block.Text || '')
    .join('\n');
  
  // Calculate average confidence
  const confidences = textBlocks
    .map((block: Block) => block.Confidence || 0)
    .filter((conf: number) => conf > 0);
  
  const avgConfidence = confidences.length > 0 
    ? confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length
    : 0;
  
  return {
    text,
    confidence: avgConfidence,
    blocks: textBlocks,
  };
}

/**
 * Process response from AnalyzeDocument
 */
function processAnalyzeDocumentResponse(response: AnalyzeDocumentResponse): TextractResult {
  const blocks = response.Blocks || [];
  const textBlocks = blocks.filter((block: Block) => block.BlockType === 'LINE');
  
  const text = textBlocks
    .map((block: Block) => block.Text || '')
    .join('\n');
  
  // Calculate average confidence
  const confidences = blocks
    .map((block: Block) => block.Confidence || 0)
    .filter((conf: number) => conf > 0);
  
  const avgConfidence = confidences.length > 0 
    ? confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length
    : 0;
  
  return {
    text,
    confidence: avgConfidence,
    blocks,
  };
}

/**
 * Check if Textract is properly configured
 */
export function isTextractConfigured(): boolean {
  return !!(import.meta.env.AWS_ACCESS_KEY_ID && import.meta.env.AWS_SECRET_ACCESS_KEY);
}

/**
 * Get supported file types for Textract
 */
export function getSupportedFileTypes(): string[] {
  return [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ];
}

/**
 * Check if file type is supported by Textract
 */
export function isFileTypeSupported(fileType: string): boolean {
  return getSupportedFileTypes().includes(fileType);
}