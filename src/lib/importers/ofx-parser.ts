
import { Transaction } from '../db/schema';

export interface OfxTransaction {
  amount: number;
  date: Date;
  description: string;
  type: 'expense' | 'income';
}

/**
 * Parses an OFX/OFC file content and extracts transaction data
 * @param content The file content as a string
 * @returns Array of parsed transactions
 */
export function parseOfxContent(content: string): OfxTransaction[] {
  const transactions: OfxTransaction[] = [];
  
  try {
    // Basic OFX parsing - this is a simple implementation
    // Extract transactions from OFX format
    const transactionMatches = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g);
    
    if (transactionMatches) {
      transactionMatches.forEach(transactionStr => {
        // Extract amount
        const amountMatch = transactionStr.match(/<TRNAMT>([-\d.]+)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
        
        // Extract date (OFX format: YYYYMMDD)
        const dateMatch = transactionStr.match(/<DTPOSTED>(\d{8})/);
        let date = new Date();
        if (dateMatch) {
          const year = parseInt(dateMatch[1].substring(0, 4));
          const month = parseInt(dateMatch[1].substring(4, 6)) - 1; // Zero-indexed month
          const day = parseInt(dateMatch[1].substring(6, 8));
          date = new Date(year, month, day);
        }
        
        // Extract description combining NAME and MEMO when available
        const nameMatch = transactionStr.match(/<NAME>([^<]*)/);
        const memoMatch = transactionStr.match(/<MEMO>([^<]*)/);

        const name = nameMatch?.[1]?.trim() || '';
        const memo = memoMatch?.[1]?.trim() || '';

        let description = 'Unknown transaction';

        if (name && memo) {
          description = `${name} - ${memo}`;
        } else if (name) {
          description = name;
        } else if (memo) {
          description = memo;
        }
        
        // Determine transaction type (expense or income)
        const type = amount < 0 ? 'expense' : 'income';
        const absoluteAmount = Math.abs(amount);
        
        transactions.push({
          amount: absoluteAmount,
          date,
          description,
          type,
        });
      });
    }
    
    return transactions;
  } catch (error) {
    console.error('Failed to parse OFX content:', error);
    return [];
  }
}

/**
 * Converts OFX transaction format to app Transaction format
 * @param ofxTransaction The parsed OFX transaction
 * @param accountId The account ID to associate with the transaction
 * @param defaultCategoryId The default category ID for uncategorized transactions
 * @returns Transaction object compatible with the app format
 */
export function convertOfxToTransaction(
  ofxTransaction: OfxTransaction,
  accountId: number,
  defaultCategoryId: number
): Omit<Transaction, 'id'> {
  return {
    description: ofxTransaction.description,
    amount: ofxTransaction.amount,
    type: ofxTransaction.type,
    date: ofxTransaction.date,
    categoryId: defaultCategoryId,
    accountId,
    notes: 'Imported from OFX/OFC file',
    createdAt: new Date()
  };
}
