'use strict';

function MyoDevice(id, version, ws, fnsByEvent) {
    var self = this;

    this.id = id;
    this.version = version;
    this.ws = ws;
    this.fnsByEvent = fnsByEvent || new Map();

    /************************** Orientation request number **************************/
    var orientationRequestNb = 0;

    this.incrementOrientationRequest = function() {
        return orientationRequestNb++;
    };

    /*********************************** Myo Lock **********************************/
    var locked = false;

    /**
     * Lock the device and perform a double short vibration
     */
    this.lock = function() {
        locked = true;
        self.vibrate('short');
        self.vibrate('short');
    };

    /**
     * Unlock the device and perform a medium vibration
     */
    this.unlock = function() {
        locked = false;
        self.vibrate();
    };

    /**
     * Lock if device is unlocked, Unlock if device is locked
     */
    this.lockOrUnlock = function() {
        if(self.isLocked()) {
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
    this.isLocked = function() {
        return locked;
    };

    /********************************* Myo vibration ********************************/
    /**
     * Vibrate myo device
     * @param intensity - 'short' | 'medium' | 'long'
     */
    this.vibrate = function(intensity) {
        intensity = intensity || 'medium';
        self.ws.send(JSON.stringify(['command',{
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
    this.rpyOffset = function(rpy) {
        if(rpy) {
            rpyOffset = rpy;
        }
        else {
            return rpyOffset;
        }
    };

    /**
     * Set the offset with the last captured roll/pitch/yaw
     */
    this.setLastRpyAsOffset = function() {
        rpyOffset = lastRpy;
    };

    /**
     * Clear the roll/pitch/yaw offset
     */
    this.clearRpyOffset = function() {
        rpyOffset = undefined;
    } ;

    /********************************* Orientation *********************************/
    var direction;

    /**
     * Get the direction which is 1 or -1 depending on the myo device x_orientation
     * @returns {number} - 1 : myo orientation 'toward_wrist', -1 : myo orientation 'toward_elbow'
     */
    this.direction = function() {
        return direction;
    };

    /**
     * Call the orientation callback functions
     * @param data - the data from websocket
     * @param rpy - the calculated roll/pitch/yaw
     * @param rpyDiff - the calculated roll/pitch/yaw diff
     */
    this.onOrientation = function(data, rpy, rpyDiff) {
        lastRpy = rpy;
        var fns = self.fnsByEvent.get('orientation');
        if(fns) {
            fns.forEach(function(fn) {
                var orientationData = {
                    accelerometer: data.accelerometer,
                    gyroscope: data.gyroscope,
                    orientation: data.orientation,
                    rpy: rpy,
                    rpyDiff: rpyDiff
                }
                fn(self, orientationData);
            });
        }
    };

    /**
     * Trigger arm recognition callbacks with the MyoDevice as argument
     * @param data - websocket pose data
     */
    this.onArmRecognized = function(data) {
        if(data.x_direction === 'toward_elbow') {
            direction = -1;
        }
        else if(data.x_direction === 'toward_wrist') {
            direction = 1;
        }
        performCallbackFns('arm_recognized');
    };

    /**
     * Trigger arm lost callbacks with the MyoDevice as argument
     * @param data - websocket pose data
     */
    this.onArmLost = function(data) {
        performCallbackFns('arm_lost');
    };

    /********************************* Pose trigger ********************************/
    /**
     * Trigger pose callbacks with the MyoDevice as argument
     * @param data - websocket pose data
     */
    this.onPose = function(data) {
        self.currenPose = data.pose;
        performCallbackFns(data.pose);
    };

    /**
     * Call every registered callbacks for the myo event
     * @param event - the myo event name
     */
    var performCallbackFns = function(event) {
        var fns = self.fnsByEvent.get(event);
        if(fns) {
            fns.forEach(function(fn) {
                fn(self);
            });
        }
    };
}