const PayloadProcessor = require('../payloadProcessor.js');

describe('PayloadProcessor', () => {
  const samplePayload = `0E50119E0000
:0100D5008000400020916A0100F1CB0100F1CB010080B500AF024B83F3088806F0DBF8C0460040002080B500AF374B12221A6007F03FFD364B180007F077FF012007F048FD302007F053FB324B324A1A60324B8022D2051A60314B314A126802210A431A602F4B304A1A60304B00221A602F4B2F4A126808218A431A60FA23DB00180007F088
:0100D6008083FB2B4B180007F0B3FC2A4BA022D2001A60294B294A1A60294B802292001A60254B284A1A60284B284A1A60224B284A1A60284B00221A601F4B274A1A60274B802292001A601C4B254A1A60254B802212061A60244B8022D2021A60234B43221A60234B41221A60224B44221A60224B40221A60214B42221A60074B8022D205C3
:END`;

  describe('analyzeHeader', () => {
    test('parses header correctly', () => {
      const processor = new PayloadProcessor(samplePayload);
      processor.analyzeHeader();
      
      expect(processor.header).toBe('00009E11500E');
      expect(processor.siliconID).toBe('9E11500E');
      expect(processor.siliconRev).toBe('00');
      expect(processor.checkSumType).toBe('00');
    });
  });

  describe('readDataLines', () => {
    test('parses data lines correctly', () => {
      const processor = new PayloadProcessor(samplePayload);
      processor.analyzeHeader();
      processor.readDataLines();
      
      expect(processor.flashDataLines).toHaveLength(3);
      
      // Check first row
      const firstRow = processor.flashDataLines[0];
      expect(firstRow.arrayID).toBe(1);
      expect(firstRow.rowNumber).toBe('D500');
      expect(firstRow.dataLength).toBe(128);
      expect(firstRow.checksum).toBe(0x88);
      expect(firstRow.data).toHaveLength(128);
      expect(firstRow.data[0]).toBe(0x00);
      expect(firstRow.data[1]).toBe(0x40);
      
      // Check second row
      const secondRow = processor.flashDataLines[1];
      expect(secondRow.arrayID).toBe(1);
      expect(secondRow.rowNumber).toBe('D600');
      expect(secondRow.dataLength).toBe(128);
      expect(secondRow.checksum).toBe(0x5C3);
    });
  });

  describe('_getMSBString', () => {
    test('converts little endian to big endian', () => {
      const processor = new PayloadProcessor('');
      expect(processor._getMSBString('1234')).toBe('3412');
      expect(processor._getMSBString('ABCDEF')).toBe('EFCDAB');
      expect(processor._getMSBString('12')).toBe('12');
    });
  });

  describe('getTotalLines', () => {
    test('returns correct line count', () => {
      const processor = new PayloadProcessor(samplePayload);
      expect(processor.getTotalLines()).toBe(4); // header + 2 data lines + :END
    });
  });

  describe('edge cases', () => {
    test('handles empty payload', () => {
      const processor = new PayloadProcessor('');
      processor.analyzeHeader();
      processor.readDataLines();
      
      expect(processor.flashDataLines).toHaveLength(0);
    });

    test('handles payload with only header', () => {
      const processor = new PayloadProcessor('004E8C1190EF');
      processor.analyzeHeader();
      processor.readDataLines();
      
      expect(processor.flashDataLines).toHaveLength(0);
    });

    test('handles whitespace in payload', () => {
      const payloadWithWhitespace = `  ${samplePayload}  `;
      const processor = new PayloadProcessor(payloadWithWhitespace);
      processor.analyzeHeader();
      processor.readDataLines();
      
      expect(processor.flashDataLines).toHaveLength(3);
    });
  });
});