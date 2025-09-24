
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseOfxContent, convertOfxToTransaction } from '@/lib/importers/ofx-parser';
import * as OfxParserModule from '@/lib/importers/ofx-parser';
import * as DbModule from '@/lib/db';
import { FileImportService } from '@/lib/importers/file-import.service';

describe('OFX Parser', () => {
  it('should parse a valid OFX content string', () => {
    const ofxContent = `
      <OFX>
        <BANKMSGSRSV1>
          <STMTTRNRS>
            <STMTRS>
              <BANKTRANLIST>
                <STMTTRN>
                  <TRNTYPE>DEBIT</TRNTYPE>
                  <DTPOSTED>20230501</DTPOSTED>
                  <TRNAMT>-50.00</TRNAMT>
                  <NAME>Coffee Shop</NAME>
                  <MEMO>Morning Latte</MEMO>
                </STMTTRN>
                <STMTTRN>
                  <TRNTYPE>CREDIT</TRNTYPE>
                  <DTPOSTED>20230502</DTPOSTED>
                  <TRNAMT>2000.00</TRNAMT>
                  <NAME>Salary</NAME>
                  <MEMO>Monthly Payment</MEMO>
                </STMTTRN>
              </BANKTRANLIST>
            </STMTRS>
          </STMTTRNRS>
        </BANKMSGSRSV1>
      </OFX>
    `;

    const result = parseOfxContent(ofxContent);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        amount: 50,
        description: 'Coffee Shop - Morning Latte',
        type: 'expense',
      })
    );
    expect(result[1]).toEqual(
      expect.objectContaining({
        amount: 2000,
        description: 'Salary - Monthly Payment',
        type: 'income',
      })
    );
  });

  it('should handle empty or invalid OFX content', () => {
    const emptyContent = '';
    expect(parseOfxContent(emptyContent)).toEqual([]);

    const invalidContent = '<OFX><INVALID>bad data</INVALID></OFX>';
    expect(parseOfxContent(invalidContent)).toEqual([]);
  });

  it('should fallback to single field when only NAME or MEMO is provided', () => {
    const ofxContent = `
      <OFX>
        <BANKMSGSRSV1>
          <STMTTRNRS>
            <STMTRS>
              <BANKTRANLIST>
                <STMTTRN>
                  <TRNTYPE>DEBIT</TRNTYPE>
                  <DTPOSTED>20230503</DTPOSTED>
                  <TRNAMT>-20.00</TRNAMT>
                  <NAME>Grocery Store</NAME>
                </STMTTRN>
                <STMTTRN>
                  <TRNTYPE>DEBIT</TRNTYPE>
                  <DTPOSTED>20230504</DTPOSTED>
                  <TRNAMT>-15.00</TRNAMT>
                  <MEMO>Online Subscription</MEMO>
                </STMTTRN>
              </BANKTRANLIST>
            </STMTRS>
          </STMTTRNRS>
        </BANKMSGSRSV1>
      </OFX>
    `;

    const result = parseOfxContent(ofxContent);

    expect(result).toHaveLength(2);
    expect(result[0].description).toBe('Grocery Store');
    expect(result[1].description).toBe('Online Subscription');
  });

  it('should convert OFX transaction to app transaction format', () => {
    const ofxTransaction = {
      amount: 100,
      date: new Date(2023, 4, 1),
      description: 'Test Transaction',
      type: 'expense' as const
    };

    const accountId = 1;
    const categoryId = 2;

    const result = convertOfxToTransaction(ofxTransaction, accountId, categoryId);

    expect(result).toEqual(
      expect.objectContaining({
        amount: 100,
        date: ofxTransaction.date,
        description: 'Test Transaction',
        type: 'expense',
        accountId,
        categoryId,
        notes: expect.any(String)
      })
    );
  });

  it('should throw when converting a transaction without a valid account', () => {
    const ofxTransaction = {
      amount: 50,
      date: new Date(2023, 4, 1),
      description: 'Invalid Account Transaction',
      type: 'income' as const,
    };

    expect(() => convertOfxToTransaction(ofxTransaction, 0, 2)).toThrow(
      'OFX transactions must be associated with a valid account.'
    );

    expect(() => convertOfxToTransaction(ofxTransaction, NaN as any, 2)).toThrow(
      'OFX transactions must be associated with a valid account.'
    );
  });
});

describe('FileImportService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should read file content', async () => {
    const mockFileContent = '<OFX>test content</OFX>';
    const mockFile = new File([mockFileContent], 'test.ofx', { type: 'text/xml' });
    
    // Mock FileReader
    const mockFileReader = {
      onload: null as any,
      onerror: null as any,
      readAsText: vi.fn().mockImplementation(function() {
        this.onload({ target: { result: mockFileContent } });
      }),
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    const result = await FileImportService.readFileContent(mockFile);
    expect(result).toBe(mockFileContent);
    expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockFile, 'UTF-8');
  });

  it('should handle file read errors', async () => {
    const mockFile = new File([''], 'test.ofx', { type: 'text/xml' });
    
    // Mock FileReader with error
    const mockFileReader = {
      onload: null as any,
      onerror: null as any,
      readAsText: vi.fn().mockImplementation(function() {
        this.onerror(new Error('File read error'));
      }),
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    await expect(FileImportService.readFileContent(mockFile)).rejects.toThrow('Failed to read file');
  });
  
  it('should import OFX file and persist transactions with the selected account', async () => {
    const mockOfxContent = '<OFX><STMTTRN><TRNAMT>-10.00</TRNAMT><DTPOSTED>20230501</DTPOSTED><MEMO>Test</MEMO></STMTTRN></OFX>';
    const parsedTransaction: OfxParserModule.OfxTransaction = {
      amount: 10,
      date: new Date('2023-05-01'),
      description: 'Test',
      type: 'expense',
    };
    const convertedTransaction = {
      description: 'Test',
      amount: 10,
      type: 'expense' as const,
      date: parsedTransaction.date,
      categoryId: 2,
      accountId: 1,
      notes: 'Imported from OFX/OFC file',
      createdAt: new Date('2023-05-02T00:00:00Z'),
    };

    const readSpy = vi.spyOn(FileImportService, 'readFileContent').mockResolvedValue(mockOfxContent);
    const encodingSpy = vi
      .spyOn(FileImportService, 'ensureUtf8Encoding')
      .mockResolvedValue(mockOfxContent);
    const parseSpy = vi.spyOn(OfxParserModule, 'parseOfxContent').mockReturnValue([parsedTransaction]);
    const convertSpy = vi
      .spyOn(OfxParserModule, 'convertOfxToTransaction')
      .mockReturnValue(convertedTransaction as any);
    const addTransactionSpy = vi
      .spyOn(DbModule, 'addTransaction')
      .mockResolvedValue(1 as any);

    const mockFile = new File([''], 'test.ofx', { type: 'text/xml' });
    const accountId = 1;
    const categoryId = 2;

    const result = await FileImportService.importOfxFile(mockFile, accountId, categoryId);

    expect(readSpy).toHaveBeenCalledWith(mockFile);
    expect(encodingSpy).toHaveBeenCalledWith(mockOfxContent);
    expect(parseSpy).toHaveBeenCalledWith(mockOfxContent);
    expect(convertSpy).toHaveBeenCalledWith(parsedTransaction, accountId, categoryId);
    expect(addTransactionSpy).toHaveBeenCalledWith(
      expect.objectContaining({ accountId })
    );
    expect(result).toEqual({ success: true, count: 1, errors: [] });

    readSpy.mockRestore();
    encodingSpy.mockRestore();
    parseSpy.mockRestore();
    convertSpy.mockRestore();
    addTransactionSpy.mockRestore();
  });
});
