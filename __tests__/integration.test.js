const fs = require('fs');
const path = require('path');
const CypressDFU = require('../index.js');

describe('Integration Tests', () => {
  test('processes real .cyacd file correctly', () => {
    const payloadPath = path.join(__dirname, '../test/bootloadable.cyacd');
    const payload = fs.readFileSync(payloadPath, 'utf8');
    
    let commandsSent = [];
    const mockWrite = jest.fn((command, callback) => {
      commandsSent.push(command);
      if (callback) callback();
    });
    
    const cypressDFU = new CypressDFU();
    const updater = cypressDFU.startUpdate(payload, mockWrite);
    
    expect(updater).toBeDefined();
    expect(updater.payload).toBeDefined();
    expect(updater.payload.flashDataLines.length).toBeGreaterThan(0);
    expect(updater.payload.siliconID).toBeDefined();
    expect(updater.payload.siliconRev).toBeDefined();
    expect(updater.payload.checkSumType).toBeDefined();
    
    // Verify first command is enter bootloader
    expect(commandsSent.length).toBeGreaterThan(0);
    expect(commandsSent[0][0]).toBe(0x01); // START
    expect(commandsSent[0][1]).toBe(0x38); // ENTER_BOOTLOADER command
  });
  
  test('maintains identical API to original', () => {
    const cypressDFU = new CypressDFU();
    
    // Check required methods exist
    expect(typeof cypressDFU.startUpdate).toBe('function');
    expect(typeof cypressDFU.on).toBe('function');
    expect(typeof cypressDFU.emit).toBe('function');
    
    // Check event emitter behavior
    const mockWrite = jest.fn((command, callback) => {
      if (callback) callback();
    });
    
    const payload = '0E50119E0000\n:0100D50080004000201BB5\n:END';
    cypressDFU.startUpdate(payload, mockWrite);
    
    expect(typeof cypressDFU.onData).toBe('function');
    expect(cypressDFU.otaUpdater).toBeDefined();
  });
  
  test('handles data flow correctly', () => {
    const cypressDFU = new CypressDFU();
    const mockWrite = jest.fn((command, callback) => {
      if (callback) callback();
    });
    
    const payload = '0E50119E0000\n:0100D50080004000201BB5\n:END';
    const updater = cypressDFU.startUpdate(payload, mockWrite);
    
    // Test that onData can be called without errors
    const mockData = Buffer.from([0x01, 0x00, 0x08, 0x00, 0x9E, 0x11, 0x50, 0x0E, 0x00, 0x3C, 0x01, 0x01, 0xAC, 0xFE, 0x17]);
    expect(() => cypressDFU.onData(mockData)).not.toThrow();
  });
});