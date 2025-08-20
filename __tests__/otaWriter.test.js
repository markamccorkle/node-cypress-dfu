const OTAWriter = require('../otaWriter.js');
const BootLoaderCommands = require('../otaCommands.js');

describe('OTAWriter', () => {
  let mockWrite;
  let writer;
  let writtenCommands;

  beforeEach(() => {
    writtenCommands = [];
    mockWrite = jest.fn((command, callback) => {
      writtenCommands.push(command);
      if (callback) callback();
    });
    writer = new OTAWriter(mockWrite);
  });

  describe('OTAEnterBootLoaderCmd', () => {
    test('creates correct enter bootloader command', (done) => {
      writer.OTAEnterBootLoaderCmd('00', () => {
        const command = writtenCommands[0];
        expect(command).toHaveLength(7);
        expect(command[0]).toBe(0x01); // START
        expect(command[1]).toBe(BootLoaderCommands.ENTER_BOOTLOADER); // COMMAND
        expect(command[2]).toBe(0x00); // DATA_SIZE_LSB
        expect(command[3]).toBe(0x00); // DATA_SIZE_MSB
        expect(command[6]).toBe(BootLoaderCommands.PACKET_END); // END
        done();
      });
    });
  });

  describe('OTAGetFlashSizeCmd', () => {
    test('creates correct get flash size command', (done) => {
      const data = [0x01];
      writer.OTAGetFlashSizeCmd(data, '00', 1, () => {
        const command = writtenCommands[0];
        expect(command).toHaveLength(8);
        expect(command[0]).toBe(0x01); // START
        expect(command[1]).toBe(BootLoaderCommands.GET_FLASH_SIZE); // COMMAND
        expect(command[2]).toBe(0x01); // DATA_SIZE_LSB
        expect(command[3]).toBe(0x00); // DATA_SIZE_MSB
        expect(command[4]).toBe(0x01); // DATA
        expect(command[7]).toBe(BootLoaderCommands.PACKET_END); // END
        done();
      });
    });
  });

  describe('OTAProgramRowCmd', () => {
    test('creates correct program row command', (done) => {
      const rowMSB = 0x00;
      const rowLSB = 0xD5;
      const arrayID = 0x01;
      const data = [0x00, 0x40, 0x00, 0x20];
      
      writer.OTAProgramRowCmd(rowMSB, rowLSB, arrayID, data, '00', () => {
        const command = writtenCommands[0];
        expect(command[0]).toBe(0x01); // START
        expect(command[1]).toBe(BootLoaderCommands.PROGRAM_ROW); // COMMAND
        expect(command[2]).toBe(0x07); // DATA_SIZE_LSB (3 + 4)
        expect(command[3]).toBe(0x00); // DATA_SIZE_MSB
        expect(command[4]).toBe(arrayID); // ARRAY_ID
        expect(command[5]).toBe(rowMSB); // ROW_MSB
        expect(command[6]).toBe(rowLSB); // ROW_LSB
        expect(command[7]).toBe(0x00); // DATA[0]
        expect(command[8]).toBe(0x40); // DATA[1]
        expect(command[9]).toBe(0x00); // DATA[2]
        expect(command[10]).toBe(0x20); // DATA[3]
        expect(command[command.length - 1]).toBe(BootLoaderCommands.PACKET_END);
        done();
      });
    });
  });

  describe('OTAVerifyRowCmd', () => {
    test('creates correct verify row command', (done) => {
      const model = { arrayID: 0x01 };
      const rowMSB = 0x00;
      const rowLSB = 0xD5;
      
      writer.OTAVerifyRowCmd(rowMSB, rowLSB, model, '00', () => {
        const command = writtenCommands[0];
        expect(command).toHaveLength(10);
        expect(command[0]).toBe(0x01); // START
        expect(command[1]).toBe(BootLoaderCommands.VERIFY_ROW); // COMMAND
        expect(command[2]).toBe(0x03); // DATA_SIZE_LSB
        expect(command[3]).toBe(0x00); // DATA_SIZE_MSB
        expect(command[4]).toBe(0x01); // ARRAY_ID
        expect(command[5]).toBe(rowMSB); // ROW_MSB
        expect(command[6]).toBe(rowLSB); // ROW_LSB
        expect(command[9]).toBe(BootLoaderCommands.PACKET_END); // END
        done();
      });
    });
  });

  describe('OTAVerifyCheckSumCmd', () => {
    test('creates correct verify checksum command', (done) => {
      writer.OTAVerifyCheckSumCmd('00', () => {
        const command = writtenCommands[0];
        expect(command).toHaveLength(7);
        expect(command[0]).toBe(0x01); // START
        expect(command[1]).toBe(BootLoaderCommands.VERIFY_CHECK_SUM); // COMMAND
        expect(command[2]).toBe(0x00); // DATA_SIZE_LSB
        expect(command[3]).toBe(0x00); // DATA_SIZE_MSB
        expect(command[6]).toBe(BootLoaderCommands.PACKET_END); // END
        done();
      });
    });
  });

  describe('OTAExitBootloaderCmd', () => {
    test('creates correct exit bootloader command', (done) => {
      writer.OTAExitBootloaderCmd('00', () => {
        const command = writtenCommands[0];
        expect(command).toHaveLength(7);
        expect(command[0]).toBe(0x01); // START
        expect(command[1]).toBe(BootLoaderCommands.EXIT_BOOTLOADER); // COMMAND
        expect(command[2]).toBe(0x00); // DATA_SIZE_LSB
        expect(command[3]).toBe(0x00); // DATA_SIZE_MSB
        expect(command[6]).toBe(BootLoaderCommands.PACKET_END); // END
        done();
      });
    });
  });

  describe('OTAProgramRowSendDataCmd', () => {
    test('creates correct send data command', (done) => {
      const data = [0x00, 0x40, 0x00, 0x20, 0x91, 0x66];
      
      writer.OTAProgramRowSendDataCmd(data, '00', () => {
        const command = writtenCommands[0];
        expect(command[0]).toBe(0x01); // START
        expect(command[1]).toBe(BootLoaderCommands.SEND_DATA); // COMMAND
        expect(command[2]).toBe(data.length); // DATA_SIZE_LSB
        expect(command[3]).toBe(0x00); // DATA_SIZE_MSB
        // Check that data is copied correctly starting from index 1
        for (let i = 1; i < data.length; i++) {
          expect(command[i + 4]).toBe(data[i]);
        }
        expect(command[command.length - 1]).toBe(BootLoaderCommands.PACKET_END);
        done();
      });
    });
  });
});