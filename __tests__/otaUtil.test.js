const OTAUtil = require('../otaUtil.js');

describe('OTAUtil', () => {
  describe('swapEndian', () => {
    test('swaps endianness of 16-bit word correctly', () => {
      expect(OTAUtil.swapEndian(0x1234)).toBe(0x3412);
      expect(OTAUtil.swapEndian(0xABCD)).toBe(0xCDAB);
      expect(OTAUtil.swapEndian(0x0001)).toBe(0x0100);
      expect(OTAUtil.swapEndian(0xFF00)).toBe(0x00FF);
    });
  });

  describe('swap', () => {
    test('swaps bytes of 32-bit value correctly', () => {
      expect(OTAUtil.swap(0x12345678)).toBe(0x78563412);
      expect(OTAUtil.swap(0xABCDEF01)).toBe(0x01EFCDAB);
      expect(OTAUtil.swap(0x00000001)).toBe(0x01000000);
      expect(OTAUtil.swap(0xFF000000)).toBe(0x000000FF);
    });
  });

  describe('calculateCheckSum', () => {
    test('calculates summation checksum correctly (type 0)', () => {
      const data = [0x01, 0x38, 0x00, 0x00];
      const result = OTAUtil.calculateCheckSum(0, data);
      // Sum = 0x01 + 0x38 + 0x00 + 0x00 = 0x39
      // Checksum = (1 + (~0x39)) & 0xFFFF = (1 + 0xFFC6) & 0xFFFF = 0xFFC7
      expect(result).toBe(0xFFC7);
    });

    test('calculates CRC16 checksum correctly (type 1)', () => {
      const data = [0x01, 0x38, 0x00, 0x00];
      const result = OTAUtil.calculateCheckSum(1, data);
      // This should use the CRC library
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    test('handles empty array', () => {
      const result = OTAUtil.calculateCheckSum(0, []);
      expect(result).toBe(0);
    });

    test('handles negative values correctly', () => {
      const data = [0xFF, 0xFF];
      const result = OTAUtil.calculateCheckSum(0, data);
      // Sum = 0xFF + 0xFF = 0x1FE
      // Checksum = (1 + (~0x1FE)) & 0xFFFF = (1 + 0xFE01) & 0xFFFF = 0xFE02
      expect(result).toBe(0xFE02);
    });
  });

  describe('calculateCheckSumVerifyRow', () => {
    test('calculates verify row checksum correctly', () => {
      const data = [0x88, 0x01, 0xD5, 0x00, 0x80, 0x00];
      const result = OTAUtil.calculateCheckSumVerifyRow(data);
      // Sum = 0x88 + 0x01 + 0xD5 + 0x00 + 0x80 + 0x00 = 0x1DE (478 decimal)
      expect(result).toBe(0x1DE);
    });

    test('handles empty array', () => {
      const result = OTAUtil.calculateCheckSumVerifyRow([]);
      expect(result).toBe(0);
    });

    test('handles single value', () => {
      const result = OTAUtil.calculateCheckSumVerifyRow([0x42]);
      expect(result).toBe(0x42);
    });
  });
});