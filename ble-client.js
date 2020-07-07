class BalenaBLE {
  constructor() {
    this.device = null;
    this.led = null;
    this.cpuVendor = null;
    this.cpuSpeed = null;
    this.onDisconnected = this.onDisconnected.bind(this);
    this.switchedTs = new Date();
    this.switchedTs.setHours(1);
    this.status = null;
    console.log(this.switchedTs);
  }

  /* the LED characteristic providing on/off capabilities */
  async setLedCharacteristic() {
    const service = await this.device.gatt.getPrimaryService(
      "a22bd383-ebdd-49ac-b2e7-40eb55f5d0ab"
    );
    const switchCharacteristic = await service.getCharacteristic(
      "a22b0090-ebdd-49ac-b2e7-40eb55f5d0ab"
    );
    /*const notifyCharacteristic = await service.getCharacteristic(
      "a22b0070-ebdd-49ac-b2e7-40eb55f5d0ab"
    );*/
    const characteristics = await service.getCharacteristics();
    console.log(characteristics);
    // characteristic.startNotifications();
    this.led = switchCharacteristic;
    //this.notify = notifyCharacteristic;

    //await this.notify.startNotifications();

    //await this.led.startNotifications();

    /*this.notify.addEventListener("characteristicvaluechanged", (event) => {
      handleLedStatusChanged(event);
    });*/
  }

  /* request connection to a BalenaBLE device */
  async request() {
    let options = {
      optionalServices: ["a22bd383-ebdd-49ac-b2e7-40eb55f5d0ab"],
    };
    options.acceptAllDevices = true;
    if (navigator.bluetooth == undefined) {
      alert("Sorry, Your device does not support Web BLE!");
      return;
    }
    this.device = await navigator.bluetooth.requestDevice(options);
    if (!this.device) {
      throw "No device selected";
    }
    this.device.addEventListener("gattserverdisconnected", this.onDisconnected);
  }

  /* connect to device */
  async connect() {
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    await this.device.gatt.connect();
  }

  /* read LED state */
  async readLed() {
    let value = await this.led.readValue();
    this.status = value.getUint8(0);
    handleLedStatusChanged(this.status);
  }

  /* change LED state */
  async writeLed(data) {
    await this.led.writeValue(Uint8Array.of(data));
    this.status = data;
    this.switchedTs = new Date();
    handleLedStatusChanged(this.status);
  }

  /* disconnect from peripheral */
  disconnect() {
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    return this.device.gatt.disconnect();
  }

  /* handler to run when device successfully disconnects */
  onDisconnected() {
    alert("Device is disconnected.");
    location.reload();
  }
}
