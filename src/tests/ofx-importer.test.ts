
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

  it('should read UTF-8 file content correctly', async () => {
    const mockFileContent = '<OFX>conteúdo com acentos: ção</OFX>';
    const mockFile = new File([mockFileContent], 'test.ofx', { type: 'text/xml' });

    const result = await FileImportService.readFileContent(mockFile);
    expect(result).toBe(mockFileContent);
  });

  it('should read ISO-8859-1 file content and convert to UTF-8', async () => {
    // Build a buffer with the ISO-8859-1 byte sequence for "Pagamento"
    // followed by a byte that is 0xE7 (ç in ISO-8859-1)
    const header = 'CHARSET:ISO-8859-1\n';
    const headerBytes = new TextEncoder().encode(header);
    // "Pagamento" in ASCII + ç (0xE7 in ISO-8859-1)
    const bodyBytes = new Uint8Array([0x50, 0x61, 0x67, 0x61, 0x6D, 0x65, 0x6E, 0x74, 0x6F, 0xE7]);
    const combined = new Uint8Array(headerBytes.length + bodyBytes.length);
    combined.set(headerBytes, 0);
    combined.set(bodyBytes, headerBytes.length);

    const mockFile = new File([combined], 'test.ofx', { type: 'text/xml' });
    const result = await FileImportService.readFileContent(mockFile);

    expect(result).toContain('CHARSET:ISO-8859-1');
    expect(result).toContain('Pagamentoç');
  });

  it('should handle file read errors from arrayBuffer', async () => {
    const mockFile = {
      arrayBuffer: vi.fn().mockRejectedValue(new Error('disk error'))
    } as unknown as File;

    await expect(FileImportService.readFileContent(mockFile)).rejects.toThrow('disk error');
  });

  it('should detect encoding from OFX headers', () => {
    expect(FileImportService.detectOfxEncoding('CHARSET:1252\n')).toBe('windows-1252');
    expect(FileImportService.detectOfxEncoding('CHARSET:ISO-8859-1\n')).toBe('iso-8859-1');
    expect(FileImportService.detectOfxEncoding('CHARSET:UTF-8\n')).toBe('utf-8');
    expect(FileImportService.detectOfxEncoding('<?xml version="1.0" encoding="iso-8859-1"?>')).toBe('iso-8859-1');
    expect(FileImportService.detectOfxEncoding('<OFX>')).toBe('utf-8');
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
