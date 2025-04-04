
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
      const transactions = parseOfxContent(content);
      
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
