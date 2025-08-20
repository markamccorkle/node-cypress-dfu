const CypressDFU = require('../index.js');

describe('CypressDFU', () => {
  let cypressDFU;
  let mockWrite;
  let writtenCommands;

  beforeEach(() => {
    cypressDFU = new CypressDFU();
    writtenCommands = [];
    mockWrite = jest.fn((command, callback) => {
      writtenCommands.push(command);
      if (callback) callback();
    });
  });

  describe('initialization', () => {
    test('creates instance successfully', () => {
      expect(cypressDFU).toBeInstanceOf(CypressDFU);
      expect(typeof cypressDFU.startUpdate).toBe('function');
      expect(typeof cypressDFU.attachEventListeners).toBe('function');
    });

    test('is an EventEmitter', () => {
      expect(typeof cypressDFU.on).toBe('function');
      expect(typeof cypressDFU.emit).toBe('function');
    });
  });

  describe('startUpdate', () => {
    const samplePayload = `004E8C1190EF
01D50000804004002091666A0100F1CB0100F1CB010080B500AF024B83F3088806F0DBF8C046004000208DB5
:END`;

    test('processes payload and creates updater', () => {
      const result = cypressDFU.startUpdate(samplePayload, mockWrite);
      
      expect(result).toBeDefined();
      expect(typeof cypressDFU.onData).toBe('function');
      expect(cypressDFU.otaUpdater).toBeDefined();
    });

    test('returns otaUpdater instance', () => {
      const result = cypressDFU.startUpdate(samplePayload, mockWrite);
      expect(result).toBe(cypressDFU.otaUpdater);
    });
  });

  describe('event forwarding', () => {
    const samplePayload = `004E8C1190EF
01D50000804004002091666A0100F1CB0100F1CB010080B500AF024B83F3088806F0DBF8C046004000208DB5
:END`;

    test('forwards progress events', (done) => {
      cypressDFU.startUpdate(samplePayload, mockWrite);
      
      cypressDFU.on('progress', (percentage) => {
        expect(typeof percentage).toBe('number');
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
        done();
      });

      // Simulate progress event from updater
      cypressDFU.otaUpdater.emit('progress', 50);
    });

    test('forwards flashStart events', (done) => {
      cypressDFU.startUpdate(samplePayload, mockWrite);
      
      cypressDFU.on('flashStart', () => {
        done();
      });

      cypressDFU.otaUpdater.emit('flashStart');
    });

    test('forwards flashFinished events', (done) => {
      cypressDFU.startUpdate(samplePayload, mockWrite);
      
      cypressDFU.on('flashFinished', () => {
        done();
      });

      cypressDFU.otaUpdater.emit('flashFinished');
    });

    test('forwards error events', (done) => {
      cypressDFU.startUpdate(samplePayload, mockWrite);
      
      cypressDFU.on('error', (err, code, message) => {
        expect(err).toBeInstanceOf(Error);
        expect(code).toBe('TEST_CODE');
        expect(message).toBe('TEST_MESSAGE');
        done();
      });

      cypressDFU.otaUpdater.emit('error', new Error('Test error'), 'TEST_CODE', 'TEST_MESSAGE');
    });
  });

  describe('attachEventListeners', () => {
    const samplePayload = `004E8C1190EF
01D50000804004002091666A0100F1CB0100F1CB010080B500AF024B83F3088806F0DBF8C046004000208DB5
:END`;

    test('attaches all required event listeners', () => {
      cypressDFU.startUpdate(samplePayload, mockWrite);
      
      // Verify that the updater has listeners attached
      expect(cypressDFU.otaUpdater.listenerCount('progress')).toBe(1);
      expect(cypressDFU.otaUpdater.listenerCount('flashStart')).toBe(1);
      expect(cypressDFU.otaUpdater.listenerCount('flashFinished')).toBe(1);
      expect(cypressDFU.otaUpdater.listenerCount('error')).toBe(1);
    });
  });

  describe('integration', () => {
    test('can handle complete workflow without errors', () => {
      const samplePayload = `004E8C1190EF
01D50000804004002091666A0100F1CB0100F1CB010080B500AF024B83F3088806F0DBF8C046004000208DB5
:END`;

      let eventsFired = {
        progress: false,
        flashStart: false,
        flashFinished: false
      };

      cypressDFU.on('progress', () => { eventsFired.progress = true; });
      cypressDFU.on('flashStart', () => { eventsFired.flashStart = true; });
      cypressDFU.on('flashFinished', () => { eventsFired.flashFinished = true; });

      const updater = cypressDFU.startUpdate(samplePayload, mockWrite);
      
      expect(updater).toBeDefined();
      expect(typeof cypressDFU.onData).toBe('function');
      
      // Simulate events
      updater.emit('flashStart');
      updater.emit('progress', 25);
      updater.emit('flashFinished');
      
      expect(eventsFired.flashStart).toBe(true);
      expect(eventsFired.progress).toBe(true);
      expect(eventsFired.flashFinished).toBe(true);
    });
  });
});