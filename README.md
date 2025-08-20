# Cypress Firmware Updater for Ionic Capacitor

`cypress-dfu` is a BLE connection agnostic library for performing firmware updates to [Cypress](http://www.cypress.com/) radios running the [Cypress OTA DFU Bootloader](http://www.cypress.com/documentation/application-notes/an97060-psoc-4-ble-and-proc-ble-over-air-ota-device-firmware-upgrade).

This version is specifically optimized for **Ionic Capacitor** applications, removing dependencies on Noble and other Node.js specific libraries to work seamlessly in Capacitor's runtime environment.

This library is a JavaScript port of the code found in the official [Cypress CySmart Mobile App](http://www.cypress.com/documentation/software-and-drivers/cysmart-mobile-app).

## Requirements
- Ionic Capacitor application
- An established BLE connection to the Cypress radio using Capacitor BLE plugins
- A handle for sending data to the DFU characteristic
- A way to pass data received from the Cypress DFU characteristic into `cypress-dfu`

## Installing
Add to your Capacitor app's `package.json`:
```json
"cypress-dfu": "github:markamccorkle/node-cypress-dfu"
```

Or install directly:
```bash
npm install github:markamccorkle/node-cypress-dfu
```


## Using with Ionic Capacitor

### Basic Usage
```typescript
import { CypressDFU } from 'cypress-dfu';

// Initialize the DFU updater
const cypressDfu = new CypressDFU();

// Set up event listeners
cypressDfu.on('progress', (progress: number) => {
  console.log(`Flashing... ${progress}%`);
});

cypressDfu.on('flashStart', () => {
  console.log('Flashing started...');
});

cypressDfu.on('flashFinished', () => {
  console.log('Flashing completed successfully!');
});

cypressDfu.on('error', (err: Error, code?: string, message?: string) => {
  console.error('Flashing error:', err, code, message);
});

// Your Capacitor BLE write method
const writeMethod = async (data: number[], callback: () => void) => {
  try {
    await BleClient.write({
      deviceId: 'your-device-id',
      service: 'your-service-uuid',
      characteristic: 'your-characteristic-uuid',
      value: new DataView(new Uint8Array(data).buffer)
    });
    callback();
  } catch (error) {
    console.error('Write error:', error);
  }
};

// Handle incoming data from BLE characteristic notifications
const handleNotification = (data: DataView) => {
  cypressDfu.onData(data.buffer);
};

// Load your .cyacd firmware file and start the update
const firmwareContent = await loadFirmwareFile(); // Your method to load .cyacd file
cypressDfu.startUpdate(firmwareContent, writeMethod);
```

### With Capacitor Community BLE Plugin
```typescript
import { BleClient, dataViewToNumbers, numbersToDataView } from '@capacitor-community/bluetooth-le';

const BLE_SERVICE_UUID = '00060000-F8CE-11E4-ABF4-0002A5D5C51B';
const BLE_CHARACTERISTIC_UUID = '00060001-F8CE-11E4-ABF4-0002A5D5C51B';

class CapacitorDfuService {
  private cypressDfu = new CypressDFU();
  private deviceId: string = '';

  async connectAndUpdate(deviceId: string, firmwareData: string) {
    this.deviceId = deviceId;
    
    // Setup DFU event listeners
    this.setupDfuListeners();
    
    // Connect to device
    await BleClient.connect(deviceId);
    
    // Subscribe to notifications
    await BleClient.startNotifications(
      deviceId,
      BLE_SERVICE_UUID,
      BLE_CHARACTERISTIC_UUID,
      (value) => this.handleNotification(value)
    );
    
    // Start firmware update
    this.cypressDfu.startUpdate(firmwareData, this.writeCharacteristic.bind(this));
  }
  
  private async writeCharacteristic(data: number[], callback: () => void) {
    try {
      await BleClient.write({
        deviceId: this.deviceId,
        service: BLE_SERVICE_UUID,
        characteristic: BLE_CHARACTERISTIC_UUID,
        value: numbersToDataView(data)
      });
      callback();
    } catch (error) {
      console.error('BLE write failed:', error);
    }
  }
  
  private handleNotification(value: DataView) {
    this.cypressDfu.onData(value.buffer);
  }
  
  private setupDfuListeners() {
    this.cypressDfu.on('progress', (progress) => {
      // Update your UI progress indicator
      console.log(`Progress: ${progress}%`);
    });
    
    this.cypressDfu.on('flashStart', () => {
      console.log('Firmware update started');
    });
    
    this.cypressDfu.on('flashFinished', () => {
      console.log('Firmware update completed');
      // Disconnect or perform cleanup
    });
    
    this.cypressDfu.on('error', (error, code, message) => {
      console.error('DFU Error:', error, code, message);
      // Handle error - maybe retry or show error to user
    });
  }
}
```

## Changes from Original

This Capacitor-optimized version includes the following changes from the original node-cypress-dfu:

### Removed Dependencies
- **Noble**: Removed Noble BLE library dependencies (noble, noble-mac, noble-winrt)
- **Underscore**: Removed underscore.js dependency 
- **Dev Dependencies**: Removed CLI tools and examples specific to Node.js

### Bug Fixes
- Fixed undefined `debug` function in `otaWriter.js`
- Fixed typo `modelData.dat.length` → `modelData.data.length` in `otaUpdater.js:313`
- Fixed undefined `currentState` → `updater.currentState` in `otaUpdater.js:242`

### Testing
- Comprehensive unit test suite with 52 tests covering all core functionality
- Integration tests to verify identical behavior with original implementation
- All data parsing, row writing, number casting, and swap functions thoroughly tested

### Compatibility
- Maintains 100% API compatibility with the original library
- Same events: `progress`, `flashStart`, `flashFinished`, `error`
- Same methods: `startUpdate()`, `onData()`
- Identical data processing and firmware update flow

## Methods
### startUpdate(payload, writeMethod)
Begins the DFU process.
- `payload` (String)
  - Contents of the .cyacd bootloadable file that should be flashed
- `writeMethod` (Method)
  - A method, or helper used to send data to the DFU Characteristic
  - Needs to match interface: `function writeMethod(data, callback)`
    - `data` (Array) bytes to be sent to the Cypress radio
    - `callback` (Method) callback for when write has completed

### onData(data)
Used to pipe data received over the BLE connection to the updater.
- `data` (Array) bytes received over the BLE link.

## Events
Events emitted by `cypress-dfu`.
Event handlers can be attached by:

```javascript
var CypressDFU = require('cypress-dfu')
CypressDFU.on([event_name], [params...])
```

### flashStart
Emitted once the DFU process has begun.
```javascript
CypressDFU.on('flashStart', function(){
  //
})
```

### flashFinished
Emitted once the DFU process has completed successfully.
```javascript
CypressDFU.on('flashFinished', function(){
  //
})
```

### error
Emitted for any errors that occur during DFU. An error indicates the DFU process has failed.
```javascript
CypressDFU.on('error', function(error, message, code){
  //
})
```

### progress
Progress events while DFU is occurring. Where `progress` is a percentage 0-100.
```javascript
CypressDFU.on('progress', function(progress){
  //
})
```

# Flashing Flow
Flow captured from debugging the CySmart app.
```
Check Sum type comes from CYACD HEADER. Either Summation or CRC16

PACKET STRUCTURE
START COMMAND LEN1 LEN2 C7 FF END
  START : 1
  COMMAND: 0xZZ
  LEN1 (LSB):
  LEN2 (MSB):
  DATA: dataLength number of bytes
  CSUM1 (LSB) crc16:
  CSUM2 (MSB) crc16:
  END: 17

RESPONSE
  START STATUS DATA END

OTAEnterBootLoaderCmd
 Write request sent with value , [ 01 38 00 00 C7 FF 17  ]

 Response
 01 00 08 00 9E 11 50 0E 00 3C 01 01 AC FE 17

 OTAGetFlashSizeCmd
 Write request sent with value , [ 01 32 01 00 01 CB FF 17  ]

 Response
 01 00 04 00 D5 00 FF 01 26 FE 17

Loop:
   OTAProgramRowCmd send size--->138
   Write request sent with value , [ 01 39 83 00 01 D5 00 00 40 00 20 91 6A 01 00 F1 CB 01 00 F1 CB 01 00 80 B5 00 AF 02 4B 83 F3 08 88 06 F0 DB F8 C0 46 00 40 00 20 80 B5 00 AF 37 4B 12 22 1A 60 07 F0 3F FD 36 4B 18 00 07 F0 77 FF 01 20 07 F0 48 FD 30 20 07 F0 53 FB 32 4B 32 4A 1A 60 32 4B 80 22 D2 05 1A 60 31 4B 31 4A 12 68 02 21 0A 43 1A 60 2F 4B 30 4A 1A 60 30 4B 00 22 1A 60 2F 4B 2F 4A 12 68 08 21 8A 43 1A 60 FA 23 DB 00 18 00 07 F0 4B D5 17  ]

   OTAVerifyRowCmd
   Write request sent with value , [ 01 3A 03 00 01 D5 00 EC FE 17  ]

OTAVerifyCheckSumCmd
Write request sent with value , [ 01 31 00 00 CE FF 17  ]

OTAExitBootloaderCmd
 Write request sent with value , [ 01 3B 00 00 C4 FF 17  ]

Reponse Byte Exit>>00
Fragment Exit bootloader response>>00
```
