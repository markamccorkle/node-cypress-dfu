const OTAReader = require('../otaReader.js');

describe('OTAReader', () => {
  let reader;

  beforeEach(() => {
    reader = new OTAReader();
  });

  describe('parseEnterBootLoaderAcknowledgement', () => {
    test('parses successful response correctly', (done) => {
      const response = '01000800009E11500E003C0101ACFE17';
      reader.parseEnterBootLoaderAcknowledgement(response, (err, siliconID, siliconRev) => {
        expect(err).toBeNull();
        expect(siliconID).toBe('009E1150');
        expect(siliconRev).toBe('0E');
        done();
      });
    });

    test('handles error response', (done) => {
      const response = '01010800009E11500E003C0101ACFE17';
      reader.parseEnterBootLoaderAcknowledgement(response, (err, siliconID, siliconRev) => {
        expect(err).toBe(1);
        expect(siliconID).toBeUndefined();
        expect(siliconRev).toBeUndefined();
        done();
      });
    });
  });

  describe('parseGetFlashSizeAcknowledgement', () => {
    test('parses successful response correctly', (done) => {
      const response = '010004000000D500FF0126FE17';
      reader.parseGetFlashSizeAcknowledgement(response, (err, startRow, endRow) => {
        expect(err).toBeNull();
        expect(startRow).toBe(0);
        expect(endRow).toBe(13959168);
        done();
      });
    });

    test('handles error response', (done) => {
      const response = '010104000000D500FF0126FE17';
      reader.parseGetFlashSizeAcknowledgement(response, (err, startRow, endRow) => {
        expect(err).toBe(1);
        expect(startRow).toBeUndefined();
        expect(endRow).toBeUndefined();
        done();
      });
    });
  });

  describe('parseParseSendDataAcknowledgement', () => {
    test('parses successful response correctly', (done) => {
      const response = '010000AAFE17';
      reader.parseParseSendDataAcknowledgement(response, (err, status) => {
        expect(err).toBeNull();
        expect(status).toBe('00');
        done();
      });
    });

    test('handles error response', (done) => {
      const response = '010100AAFE17';
      reader.parseParseSendDataAcknowledgement(response, (err, status) => {
        expect(err).toBe(1);
        expect(status).toBeUndefined();
        done();
      });
    });
  });

  describe('parseParseRowAcknowledgement', () => {
    test('parses successful response correctly', (done) => {
      const response = '010000AAFE17';
      reader.parseParseRowAcknowledgement(response, (err, status) => {
        expect(err).toBeNull();
        expect(status).toBe('00');
        done();
      });
    });

    test('handles error response', (done) => {
      const response = '010100AAFE17';
      reader.parseParseRowAcknowledgement(response, (err, status) => {
        expect(err).toBe(1);
        expect(status).toBeUndefined();
        done();
      });
    });
  });

  describe('parseVerifyRowAcknowledgement', () => {
    test('parses successful response correctly', (done) => {
      const response = '01000088FE17';
      reader.parseVerifyRowAcknowledgement(response, (err, response_code, checksum) => {
        expect(err).toBeNull();
        expect(response_code).toBe('00');
        expect(checksum).toBe('FE');
        done();
      });
    });

    test('handles error response', (done) => {
      const response = '01010088FE17';
      reader.parseVerifyRowAcknowledgement(response, (err, response_code, checksum) => {
        expect(err).toBe(1);
        expect(response_code).toBeUndefined();
        expect(checksum).toBeUndefined();
        done();
      });
    });
  });

  describe('parseVerifyCheckSum', () => {
    test('parses successful response correctly', (done) => {
      const response = '01000001FE17';
      reader.parseVerifyCheckSum(response, (err, checkSumStatus) => {
        expect(err).toBeNull();
        expect(checkSumStatus).toBe('00');
        done();
      });
    });

    test('handles error response', (done) => {
      const response = '01010001FE17';
      reader.parseVerifyCheckSum(response, (err, checkSumStatus) => {
        expect(err).toBe(1);
        expect(checkSumStatus).toBeUndefined();
        done();
      });
    });
  });

  describe('parseExitBootloader', () => {
    test('parses exit bootloader response', (done) => {
      const response = '0100';
      reader.parseExitBootloader(response, (err, result) => {
        expect(err).toBeNull();
        expect(result).toBe('0100');
        done();
      });
    });

    test('handles response with whitespace', (done) => {
      const response = '  0100  ';
      reader.parseExitBootloader(response, (err, result) => {
        expect(err).toBeNull();
        expect(result).toBe('0100');
        done();
      });
    });
  });

  describe('edge cases', () => {
    test('handles empty response strings', (done) => {
      reader.parseEnterBootLoaderAcknowledgement('', (err) => {
        expect(err).toBeDefined();
        done();
      });
    });

    test('handles response with spaces', (done) => {
      const response = '  01 00 08 00 9E 11 50 0E 00 3C 01 01 AC FE 17  ';
      reader.parseEnterBootLoaderAcknowledgement(response, (err, siliconID, siliconRev) => {
        expect(err).toBeNull();
        expect(siliconID).toBe('00 9E 11');
        expect(siliconRev).toBe(' 5');
        done();
      });
    });
  });
});