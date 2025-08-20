const OTAFlashRow = require('../models/OTAFlashRow.js');

describe('OTAFlashRow', () => {
  test('creates instance with all parameters', () => {
    const arrayID = 1;
    const rowNumber = '00D5';
    const dataLength = 128;
    const data = [0x00, 0x40, 0x00, 0x20];
    const checksum = 0x88;
    
    const row = new OTAFlashRow(arrayID, rowNumber, dataLength, data, checksum);
    
    expect(row.arrayID).toBe(arrayID);
    expect(row.rowNumber).toBe(rowNumber);
    expect(row.dataLength).toBe(dataLength);
    expect(row.data).toBe(data);
    expect(row.checksum).toBe(checksum);
  });

  test('creates instance with no parameters', () => {
    const row = new OTAFlashRow();
    
    expect(row.arrayID).toBeUndefined();
    expect(row.rowNumber).toBeUndefined();
    expect(row.dataLength).toBeUndefined();
    expect(row.data).toBeUndefined();
    expect(row.checksum).toBeUndefined();
  });

  test('allows setting properties after creation', () => {
    const row = new OTAFlashRow();
    
    row.arrayID = 2;
    row.rowNumber = '01A0';
    row.dataLength = 64;
    row.data = [0xFF, 0x00];
    row.checksum = 0xAB;
    
    expect(row.arrayID).toBe(2);
    expect(row.rowNumber).toBe('01A0');
    expect(row.dataLength).toBe(64);
    expect(row.data).toEqual([0xFF, 0x00]);
    expect(row.checksum).toBe(0xAB);
  });
});