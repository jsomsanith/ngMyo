'use strict';

function MyoDevice(id, version, ws, fnsByEvent) {
  var self = this;

  this.id = id;
  this.version = version;
  this.ws = ws;
  this.fnsByEvent = fnsByEvent || new Map();

  /************************** Orientation request number **************************/
  var orientationRequestNb = 0;

  this.incrementOrientationRequest = function () {
    return orientationRequestNb++;
  };

  /*********************************** Myo init **********************************/
  this.init = function () {
    this.unlock();
  };

  /*********************************** Myo Lock **********************************/
  var locked;

  /**
   * Lock the device
   */
  this.lock = function () {
    self.ws.send(JSON.stringify(['command', {
      command: 'lock',
      myo: self.id
    }]));

    locked = true;
  };

  /**
   * Unlock the device in hold mode (no timing)
   */
  this.unlock = function () {
    console.log('unlock');
    self.ws.send(JSON.stringify(['command', {
      command: 'unlock',
      myo: self.id,
      type: "hold"
    }]));

    locked = false;
  };

  /**
   * Lock if device is unlocked, Unlock if device is locked
   */
  this.lockOrUnlock = function () {
    if (self.isLocked()) {
      self.unlock();
    }
    else {
      self.lock();
    }
  };

  /**
   * Test if device is locked
   * @returns {boolean} - true if device is locked
   */
  this.isLocked = function () {
    return locked;
  };

  /**
   * Update the lock flag
   * @param deviceIsLocked - the new lock flag value
   */
  this.setLock = function (deviceIsLocked) {
    this.locked = deviceIsLocked;
  };

  /********************************* Myo vibration ********************************/
  /**
   * Vibrate myo device
   * @param intensity - 'short' | 'medium' | 'long'
   */
  this.vibrate = function (intensity) {
    intensity = intensity || 'medium';
    self.ws.send(JSON.stringify(['command', {
      command: 'vibrate',
      myo: self.id,
      type: intensity
    }]));
  };

  /********************************* Orientation offset ********************************/
  var rpyOffset, lastRpy;

  /**
   * Getter/Setter for the roll/pitch/yaw offset
   * @param rpy - if defined, set the offset, else get the offset
   * @returns {{roll: number, pitch: number, yaw: number}} - the offset
   */
  this.rpyOffset = function (rpy) {
    if (rpy) {
      rpyOffset = rpy;
    }
    else {
      return rpyOffset;
    }
  };

  /**
   * Set the offset with the last captured roll/pitch/yaw
   */
  this.setLastRpyAsOffset = function () {
    rpyOffset = lastRpy;
  };

  /**
   * Clear the roll/pitch/yaw offset
   */
  this.clearRpyOffset = function () {
    rpyOffset = undefined;
  };

  /********************************* Orientation *********************************/
  var direction;

  /**
   * Get the direction which is 1 or -1 depending on the myo device x_orientation
   * @returns {number} - 1 : myo orientation 'toward_wrist', -1 : myo orientation 'toward_elbow'
   */
  this.direction = function () {
    return direction;
  };

  /**
   * Call the orientation callback functions
   * @param data - the data from websocket
   * @param rpy - the calculated roll/pitch/yaw
   * @param rpyDiff - the calculated roll/pitch/yaw diff
   */
  this.onOrientation = function (data, rpy, rpyDiff) {
    lastRpy = rpy;
    var fns = self.fnsByEvent.get('orientation');
    if (fns) {
      fns.forEach(function (fn) {
        var orientationData = {
          accelerometer: data.accelerometer,
          gyroscope: data.gyroscope,
          orientation: data.orientation,
          rpy: rpy,
          rpyDiff: rpyDiff
        };
        fn(self, orientationData);
      });
    }
  };

  /**
   * Trigger arm recognition callbacks with the MyoDevice as argument
   * @param data - websocket pose data
   */
  this.onArmRecognized = function (data) {
    if (data.x_direction === 'toward_elbow') {
      direction = -1;
    }
    else if (data.x_direction === 'toward_wrist') {
      direction = 1;
    }
    performCallbackFns('arm_recognized');
  };

  /**
   * Trigger arm lost callbacks with the MyoDevice as argument
   * @param data - websocket pose data
   */
  this.onArmLost = function (data) {
    performCallbackFns('arm_lost');
  };

  /**
   * Trigger arm lost callbacks with the MyoDevice as argument
   * @param data - websocket pose data
   */
  this.onRegistered = function (data) {
    performCallbackFns('registered');
  };

  /********************************* Pose trigger ********************************/
  /**
   * Trigger pose callbacks with the MyoDevice as argument
   * @param data - websocket pose data
   */
  this.onPose = function (data) {
    self.currenPose = data.pose;
    performCallbackFns(data.pose);
  };

  /**
   * Trigger EMG Data
   * @param data - websocket emg data
   */
  this.onEmgData = function (data) {
    var fns = self.fnsByEvent.get('emg');
    if (fns) {
      console.log("funcs: " + fns.length);
      fns.forEach(function (fn) {
        var emgData = {
          emg: data.emg,
          timestamp: data.timestamp
        };
        fn(self, emgData);
      });
    }
  };

  /**
   * Trigger RSSI Data
   * @param data - websocket rssi data
   */
  this.onRssiData = function (data) {
    var fns = self.fnsByEvent.get('rssi');
    if (fns) {
      console.log("funcs: " + fns.length);
      fns.forEach(function (fn) {
        fn(self, data.rssi);
      });
    }
  };

  /**
   * Call every registered callbacks for the myo event
   * @param event - the myo event name
   */
  var performCallbackFns = function (event) {
    var fns = self.fnsByEvent.get(event);
    if (fns) {
      fns.forEach(function (fn) {
        fn(self);
      });
    }
  };

  this.startStreamEmg = function () {
    self.ws.send(JSON.stringify(['command', {
      command: 'set_stream_emg',
      myo: self.id,
      type: "enabled"
    }]));
  };

  this.stopStreamEmg = function () {
    self.ws.send(JSON.stringify(['command', {
      command: 'set_stream_emg',
      myo: self.id,
      type: "disabled"
    }]));
  };

  this.requestRssi = function () {
    self.ws.send(JSON.stringify(['command', {
      command: 'request_rssi',
      myo: self.id
    }]));
  };
}
