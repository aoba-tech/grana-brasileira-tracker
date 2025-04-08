
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
      reader.readAsText(file, 'UTF-8');
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
    
    // For special characters common in Portuguese
    try {
      // Replace common encoding issues with proper UTF-8 characters
      return content
        .replace(/\xE3/g, 'ã')
        .replace(/\xE1/g, 'á')
        .replace(/\xE9/g, 'é')
        .replace(/\xED/g, 'í')
        .replace(/\xF3/g, 'ó')
        .replace(/\xFA/g, 'ú')
        .replace(/\xE7/g, 'ç')
        .replace(/\xEA/g, 'ê')
        .replace(/\xF4/g, 'ô')
        .replace(/\xC3/g, 'Ã')
        .replace(/\xC1/g, 'Á')
        .replace(/\xC9/g, 'É')
        .replace(/\xCD/g, 'Í')
        .replace(/\xD3/g, 'Ó')
        .replace(/\xDA/g, 'Ú')
        .replace(/\xC7/g, 'Ç')
        .replace(/\xCA/g, 'Ê')
        .replace(/\xD4/g, 'Ô')
        .replace(/\xE0/g, 'à')
        .replace(/\xF9/g, 'ù')
        .replace(/\xF5/g, 'õ')
        .replace(/\xD5/g, 'Õ');
    } catch (error) {
      console.warn('Encoding conversion failed, using content as-is:', error);
    }
    
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
