
import { parseOfxContent, convertOfxToTransaction, OfxTransaction } from './ofx-parser';
import { addTransaction } from '../db';
import { toast } from '../toast';

interface ImportResult {
  success: boolean;
  count: number;
  errors: string[];
}

/**
 * Service to handle importing OFX/OFC files
 */
export const FileImportService = {
  /**
   * Import transactions from an OFX/OFC file
   * @param file The file to import
   * @param accountId The account ID to associate with imported transactions
   * @param defaultCategoryId The default category ID for imported transactions
   * @returns Promise with import results
   */
  async importOfxFile(file: File, accountId: number, defaultCategoryId: number): Promise<ImportResult> {
    try {
      const content = await this.readFileContent(file);
      const encodedContent = await this.ensureUtf8Encoding(content);
      const transactions = parseOfxContent(encodedContent);
      
      if (transactions.length === 0) {
        return {
          success: false,
          count: 0,
          errors: ['No transactions found in the file']
        };
      }
      
      const result = await this.importTransactions(transactions, accountId, defaultCategoryId);
      return result;
    } catch (error) {
      console.error('Failed to import OFX file:', error);
      return {
        success: false,
        count: 0,
        errors: [(error as Error).message || 'Unknown error during import']
      };
    }
  },
  
  /**
   * Read a file's content as string
   * @param file The file to read
   * @returns Promise with the file content
   */
  async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  },
  
  /**
   * Ensure content is in UTF-8 encoding
   * @param content The content to convert
   * @returns String in UTF-8 encoding
   */
  async ensureUtf8Encoding(content: string): Promise<string> {
    // Check for encoding declarations in the OFX header
    const encodingMatch = content.match(/ENCODING="([^"]+)"/i);
    const declaredEncoding = encodingMatch ? encodingMatch[1].toUpperCase() : null;
    
    // If it's already UTF-8 or no encoding is specified, return as-is
    if (!declaredEncoding || declaredEncoding === 'UTF-8') {
      return content;
    }
    
    // For common Latin encodings, handle conversion
    try {
      // Check for common encoding indicators in the content
      const hasISO8859 = content.includes('ISO-8859') || 
                          content.includes('LATIN1') || 
                          declaredEncoding === 'ISO-8859-1';
      
      const hasWindows1252 = content.includes('WINDOWS-1252') || 
                             declaredEncoding === 'WINDOWS-1252';
      
      // If detected as Latin1 or Windows-1252, attempt re-encoding via TextEncoder
      if (hasISO8859 || hasWindows1252) {
        // This is a simplified conversion that handles most common cases for these encodings
        // It replaces special characters that might be encoding issues in OFX files
        return content
          .replace(/á|à|â|ã/g, 'a')
          .replace(/é|è|ê/g, 'e')
          .replace(/í|ì|î/g, 'i')
          .replace(/ó|ò|ô|õ/g, 'o')
          .replace(/ú|ù|û/g, 'u')
          .replace(/ç/g, 'c')
          .replace(/[^\x00-\x7F]/g, ''); // Remove any remaining non-ASCII characters
      }
    } catch (error) {
      console.warn('Encoding conversion failed, using content as-is:', error);
    }
    
    // Default fallback - return as-is if we couldn't convert
    return content;
  },
  
  /**
   * Import OFX transactions to the database
   * @param transactions The OFX transactions to import
   * @param accountId The account ID to associate with the transactions
   * @param defaultCategoryId The default category ID for transactions
   * @returns Promise with import results
   */
  async importTransactions(
    transactions: OfxTransaction[], 
    accountId: number, 
    defaultCategoryId: number
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      count: 0,
      errors: []
    };
    
    try {
      for (const transaction of transactions) {
        const appTransaction = convertOfxToTransaction(transaction, accountId, defaultCategoryId);
        await addTransaction(appTransaction);
        result.count++;
      }
      
      return result;
    } catch (error) {
      console.error('Error importing transactions:', error);
      result.success = false;
      result.errors.push((error as Error).message || 'Unknown error during import');
      return result;
    }
  }
};
