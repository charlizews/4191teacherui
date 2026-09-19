// bluetooth.js

// Standard Nordic UART Service & RX Characteristic UUIDs
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const UART_RX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

let bluetoothDevice = null;
let gattServer = null;
let rxCharacteristic = null;

/**
 * Connects to a Bluetooth BLE device and initializes the RX characteristic.
 */
export async function connectToRobot() {
  // Force cleanup if a ghost connection exists
  if (gattServer && gattServer.connected) {
    gattServer.disconnect();
  }

  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [UART_SERVICE_UUID]
    });

    // Reset UI if the robot loses power or goes out of range
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);

    gattServer = await bluetoothDevice.gatt.connect();
    const service = await gattServer.getPrimaryService(UART_SERVICE_UUID);
    rxCharacteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC);

    return bluetoothDevice.name || "Robot Device";
  } catch (error) {
    throw new Error(error.message || "Connection failed.");
  }
}

function onDisconnected() {
  console.warn("Robot disconnected!");
  // Optional: Reset button state here if needed
}

/**
 * Sends a string message to the ESP32 via BLE.
 * Required by grid.js!
 */
export async function sendData(dataString) {
  if (!rxCharacteristic) {
    throw new Error("No active Bluetooth connection!");
  }
  const encoder = new TextEncoder();
  await rxCharacteristic.writeValue(encoder.encode(dataString));
}

/**
 * Returns true if the Bluetooth connection is currently active.
 */
export function isConnected() {
  return gattServer && gattServer.connected;
}