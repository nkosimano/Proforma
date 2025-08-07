import { IPdfLayoutStrategy } from './IPdfLayoutStrategy';
import { GeneralLayoutStrategy } from './strategies/GeneralLayoutStrategy';
import { MedicalLayoutStrategy } from './strategies/MedicalLayoutStrategy';
import { LegalLayoutStrategy } from './strategies/LegalLayoutStrategy';
import { AccountingLayoutStrategy } from './strategies/AccountingLayoutStrategy';
import { EngineeringLayoutStrategy } from './strategies/EngineeringLayoutStrategy';

/**
 * Factory class for creating PDF layout strategies based on profession type
 */
export class PdfLayoutFactory {
  /**
   * Create a PDF layout strategy instance based on the profession type
   * @param professionType - The profession type (General, Medical, Legal, Accounting, Engineering)
   * @returns An instance of the appropriate PDF layout strategy
   */
  static create(professionType: string): IPdfLayoutStrategy {
    // Normalize the profession type to handle case variations
    const normalizedType = professionType?.toLowerCase().trim() || 'general';
    
    switch (normalizedType) {
      case 'medical':
        return new MedicalLayoutStrategy();
      
      case 'legal':
        return new LegalLayoutStrategy();
      
      case 'accounting':
        return new AccountingLayoutStrategy();
      
      case 'engineering':
        return new EngineeringLayoutStrategy();
      
      case 'general':
      default:
        return new GeneralLayoutStrategy();
    }
  }
  
  /**
   * Get all available profession types
   * @returns Array of supported profession types
   */
  static getSupportedProfessions(): string[] {
    return ['General', 'Medical', 'Legal', 'Accounting', 'Engineering'];
  }
  
  /**
   * Check if a profession type is supported
   * @param professionType - The profession type to check
   * @returns True if the profession type is supported, false otherwise
   */
  static isSupported(professionType: string): boolean {
    const normalizedType = professionType?.toLowerCase().trim() || '';
    const supportedTypes = this.getSupportedProfessions().map(type => type.toLowerCase());
    return supportedTypes.includes(normalizedType);
  }
  
  /**
   * Get the default profession type
   * @returns The default profession type
   */
  static getDefaultProfession(): string {
    return 'General';
  }
}