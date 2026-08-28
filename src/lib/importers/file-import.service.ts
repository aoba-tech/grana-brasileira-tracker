
import { parseOfxContent, convertOfxToTransaction, OfxTransaction } from './ofx-parser';
import { addTransaction } from '../db';
import { toast } from '../../lib/toast';

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
   * Read a file's content as a UTF-8 string, detecting and honouring the
   * encoding declared in the OFX/SGML header.
   * Brazilian bank OFX files are often Windows-1252 or ISO-8859-1.
   * Reading the raw bytes first and decoding with the correct charset preserves accented characters.
   */
  async readFileContent(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();

    // Peek at the first 512 bytes using latin-1 (lossless for any byte value) to read the header
    const preview = new TextDecoder('iso-8859-1').decode(buffer.slice(0, 512));
    const encoding = this.detectOfxEncoding(preview);

    return new TextDecoder(encoding).decode(buffer);
  },

  /**
   * Detect the text encoding declared in the OFX/SGML header.
   * Returns a label accepted by TextDecoder (e.g. 'utf-8', 'windows-1252').
   */
  detectOfxEncoding(preview: string): string {
    // XML-style OFX: <?xml version="1.0" encoding="iso-8859-1"?>
    const xmlMatch = preview.match(/encoding=["']([^"']+)["']/i);
    if (xmlMatch) return xmlMatch[1].toLowerCase();

    // SGML flat header: CHARSET:1252  or  CHARSET:ISO-8859-1
    const charsetMatch = preview.match(/CHARSET[=:]([^\s<>\r\n]+)/i);
    if (charsetMatch) {
      const val = charsetMatch[1].trim().toUpperCase();
      if (val === '1252' || val === 'WINDOWS-1252') return 'windows-1252';
      if (val.startsWith('ISO-8859') || val.startsWith('ISO8859')) return 'iso-8859-1';
      if (val === 'UTF-8' || val === 'UTF8') return 'utf-8';
    }

    return 'utf-8';
  },

  /**
   * No-op kept for API compatibility — encoding is now handled in readFileContent.
   */
  async ensureUtf8Encoding(content: string): Promise<string> {
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
