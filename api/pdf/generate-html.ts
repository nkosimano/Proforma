import { Request, Response } from 'express';
import { PdfGenerator } from '../services/pdf/pdfGenerator';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profession, quoteData } = req.body;

    if (!profession || !quoteData) {
      return res.status(400).json({ 
        error: 'Missing required fields: profession and quoteData' 
      });
    }

    // Generate HTML using the PDF service
    const html = await PdfGenerator.generateQuoteHTML(profession, quoteData);

    return res.status(200).json({ 
      success: true,
      html 
    });
  } catch (error) {
    console.error('PDF HTML generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF HTML',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}