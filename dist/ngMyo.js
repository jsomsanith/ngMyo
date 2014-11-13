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
}'use strict';

(function() {
   angular.module('ngMyo', [])
       .constant('MyoOptions', {
           wsUrl:                   'ws://127.0.0.1:10138/myo/',
           apiVersion:              1,
           useRollPitchYaw:         true,
           broadcastOnConnected:    true,
           broadcastOnDisconnected: true,
           broadcastOnLockUnlock:   true,
           skipOneOrientationEvery: 2,
           rollPitchYawScale:       18,
           lockUnlockPose:          'thumb_to_pinky',
           lockUnlockPoseTime:      500,
           poseTime:                250
       });
})();'use strict';

(function() {
    function MyoOrientation() {
        /**
         * Calculate the roll, pitch and yaw from orientation quanternion
         *
         * @param quat - a quaternion
         * @param scale - the scale (roll, pitch and yaw will be within [0, scale]
         * @param direction - the myo device x_direction. 1 : myo orientation 'toward_wrist', -1 : myo orientation 'toward_elbow'
         * @returns {{roll: number, pitch: number, yaw: number}}
         */
        this.calculateRPY = function(quat, scale, direction) {
            var rpyRad = {
                roll: Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x * quat.x + quat.y * quat.y)),
                pitch: Math.asin(Math.max(-1, Math.min(1, 2 * (quat.w * quat.y - quat.z * quat.x)))),
                yaw: Math.atan2(2 * (quat.w * quat.z + quat.x * quat.y), 1 - 2 * (quat.y * quat.y + quat.z * quat.z))
            };

            return {
                roll: (rpyRad.roll + Math.PI)/(Math.PI * 2) * scale * direction,
                pitch: (rpyRad.pitch + Math.PI/2)/Math.PI * scale * direction,
                yaw: (rpyRad.yaw + Math.PI)/(Math.PI * 2) * scale
            };
        };

        /**
         * The roll/pitch/yaw depends on the direction of the myo device.
         * This function calculate the diff between a starting rpy (or offset) and the current rpy.
         * The diff is then normalize to have a unique scale, not depending on device direction, and a clear vision of the movement the user just performed.
         *
         * Roll : rotate to the left --> negative from 0 to -(scale/2)
         * Roll : rotate to the right --> positive from 0 to (scale/2)
         *
         * Pitch : lower arm --> negative from 0 to -(scale/2)
         * Pitch : raise arm --> positive from 0 to (scale/2)
         *
         * Yaw : arm to the left --> negative from 0 to -(scale/2)
         * Yaw : arm to the right --> positive from 0 to (scale/2)
         *
         * @param rpy - the current roll/pitch/yaw
         * @param rpyOffset - the starting roll/pitch/yaw
         * @param rpyScale - the roll/pitch/yaw scale
         * @returns {{roll: number, pitch: number, yaw: number}} - the roll/pitch/yaw diff
         */
        this.calculateRPYDiff = function(rpy, rpyOffset, rpyScale) {
            var roll = adaptWithScale(rpy.roll - rpyOffset.roll, rpyScale);
            var pitch = adaptWithScale(rpyOffset.pitch - rpy.pitch, rpyScale);
            var yaw =  adaptWithScale(rpyOffset.yaw - rpy.yaw, rpyScale);

            return {
                roll: roll,
                pitch: pitch,
                yaw: yaw
            }
        };

        var adaptWithScale = function(value, scale) {
            var threashold = scale / 2;
            if(value > threashold) {
                return value - scale;
            }
            else if(value < -threashold) {
                return value + scale;
            }
            else {
                return value;
            }
        };
    }

    angular.module('ngMyo')
        .service('MyoOrientation', [MyoOrientation]);
})();'use strict';

(function() {

    function Myo($rootScope, $window, $timeout, MyoOptions, MyoOrientation) {
        var self = this;

        var instanceOptions = {};
        var devices = new Map();
        var eventsByDevice = new Map();
        var lockTimeouts = new Map();

        /************************************** Getters ***************************************/
	    this.getDevice = function(deviceID) {
		    return devices.get(deviceID);
	    };

	    this.getEventsForDevice = function(deviceID) {
		    return eventsByDevice.get(deviceID);
	    };

	    this.getOptions = function() {
		    return instanceOptions;
	    };

        /************************************** helpers ***************************************/
        /**
         * Test if orientation request should be skipped.
         *
         * ngMyo skip the request if the instanceOptions.skipOneOrientationEvery option is defined and the request number is n * instanceOptions.skipOneOrientationEvery
         * ex : instanceOptions.skipOneOrientationEvery = 2, ngMyo will skip 1 request every 2 requests
         *
         * @param device - the {@link MyoDevice}
         * @returns {skipOneOrientationEvery|*|boolean} - truthy if request should be skipped
         */
        var shouldSkipOrientation = function(device) {
            var requestNb = device.incrementOrientationRequest();
            return instanceOptions.skipOneOrientationEvery && requestNb % instanceOptions.skipOneOrientationEvery === 0;
        };

        /**
         * Test if variable is integer
         *
         * @param variable - the value du test
         * @returns {boolean} - true if variable is an integer
         */
        var isInteger = function(variable) {
            return typeof variable === 'number' && (variable % 1) === 0;
        };

        /*************************************** Events listeners ****************************************/
        /**
         *
         * @param eventName - 'armRecognized' | 'armLost' | 'thumb_to_pinky' | 'fingers_spread' | 'wave_in' | 'wave_out' | 'fist'
         * @param fn - callback function taking a {@link MyoDevice} as argument
         * @param deviceId - Myo device id. If undefined, this callback will be attached to myo device 0
         */
        this.on = function(eventName, fn, deviceId) {
            if(!deviceId) {
                deviceId = 0;
            }

            var fnsByEvent = eventsByDevice.get(deviceId) || new Map();
            var fns = fnsByEvent.get(eventName) || [];
            fns.push(fn);

            fnsByEvent.set(eventName, fns);
            eventsByDevice.set(deviceId, fnsByEvent);

            return self;
        };

        /************************************** start with options ***************************************/
        /**
         * Define ngMyo options and initialize websocket listeners
         * @param customOptions - user options. If not defined, ngMyo will take default options
         */
        this.start = function(customOptions) {
            initOptions(customOptions);
            initWebSocket();
        };

        /**
         * Initialize options combining custom options and default options
         * @param customOptions - user options. If not defined, ngMyo will take default options
         */
        var initOptions = function(customOptions) {
            if(customOptions) {
                instanceOptions.useRollPitchYaw = customOptions.useRollPitchYaw !== undefined ? customOptions.useRollPitchYaw : MyoOptions.useRollPitchYaw;
                instanceOptions.rollPitchYawScale = customOptions.rollPitchYawScale !== undefined ? customOptions.rollPitchYawScale : MyoOptions.rollPitchYawScale;
                instanceOptions.broadcastOnConnected = customOptions.broadcastOnConnected !== undefined ? customOptions.broadcastOnConnected : MyoOptions.broadcastOnConnected;
                instanceOptions.broadcastOnDisconnected = customOptions.broadcastOnDisconnected !== undefined ? customOptions.broadcastOnDisconnected : MyoOptions.broadcastOnDisconnected;
                instanceOptions.broadcastOnLockUnlock = customOptions.broadcastOnLockUnlock !== undefined ? customOptions.broadcastOnLockUnlock : MyoOptions.broadcastOnLockUnlock;
                instanceOptions.skipOneOrientationEvery = isInteger(customOptions.skipOneOrientationEvery) ? customOptions.skipOneOrientationEvery : MyoOptions.skipOneOrientationEvery;
                instanceOptions.lockUnlockPose = customOptions.lockUnlockPose !== undefined ? customOptions.lockUnlockPose : MyoOptions.lockUnlockPose;
                instanceOptions.lockUnlockPoseTime = isInteger(customOptions.lockUnlockPoseTime) ? customOptions.lockUnlockPoseTime : MyoOptions.lockUnlockPoseTime;
                instanceOptions.poseTime = isInteger(customOptions.poseTime) ? customOptions.poseTime : MyoOptions.poseTime;
            }
            else {
                instanceOptions = MyoOptions;
            }
        };

        /**
         * Initialize websocket and listeners
         */
        var initWebSocket = function() {
            if (!$window.WebSocket){
                throw new Error('Socket not supported by browser');
            }

            var ws = new $window.WebSocket(MyoOptions.wsUrl + MyoOptions.apiVersion);
            ws.onmessage = function(message) {
                var data = JSON.parse(message.data);
                if(data[0] === 'event') {
                    switch(data[1].type) {
                        case 'orientation' :
                            triggerOrientation(data[1]);
                            break;
                        case 'pose' :
                            triggerPose(data[1]);
                            break;
                        case 'connected' :
                            registerDevice(data[1]);
                            break;
                        case 'disconnected' :
                            unregisterDevice(data[1]);
                            break;
                        case 'arm_recognized' :
                            triggerArmRecognized(data[1]);
                            break;
                        case 'arm_lost' :
                            triggerArmLost(data[1]);
                            break;
                        default :
                            console.log(data[1]);
                            break;
                    }
                }
            };

            /**
             * Create a new {@link MyoDevice} based on data and attach registered callbacks (see {@link Myo#on}
             * @param data - websocket data
             */
            var registerDevice = function(data) {
                devices.set(data.myo, new MyoDevice(data.myo, data.version.join('.'), ws, eventsByDevice.get(data.myo)));
                if(instanceOptions.broadcastOnConnected) {
                    $rootScope.$broadcast('ngMyoConnected', data.myo);
                }
            };

            /**
             * Delete a {@link MyoDevice}. This is called on myo disconnected event
             * @param data - websocket data
             */
            var unregisterDevice = function(data) {
                devices.delete(data.myo);
                if(instanceOptions.broadcastOnDisconnected) {
                    $rootScope.$broadcast('ngMyoDisconnected', data.myo);
                }
            };

            /**
             * Action when an orientation message is sent.
             * The action is not triggered if device is locked or if this event should be skipped (see {@link Myo#shouldSkipOrientation})
             * @param data - websocket data
             */
            var triggerOrientation = function(data) {
                var device = devices.get(data.myo);
                if(device && !device.isLocked() && !shouldSkipOrientation(device)) {
                    var rpy, rpyDiff;
                    if(instanceOptions.useRollPitchYaw) {
                        rpy = MyoOrientation.calculateRPY(data.orientation, instanceOptions.rollPitchYawScale, device.direction());
                        if(device.rpyOffset()) {
                            rpyDiff = MyoOrientation.calculateRPYDiff(rpy, device.rpyOffset(), instanceOptions.rollPitchYawScale);
                        }
                    }
                    device.onOrientation(data, rpy, rpyDiff);
                }
            };

            /**
             * Action when user perform arm recognition gesture
             * @param data - websocket data
             */
            var triggerArmRecognized = function(data) {
                var device = devices.get(data.myo);
                if(device) {
                    device.onArmRecognized(data);
                }
            };

            /**
             * Action when arm is lost (myo device moved or removed)
             * @param data - websocket data
             */
            var triggerArmLost = function(data) {
                var device = devices.get(data.myo);
                if(device) {
                    device.onArmLost(data);
                }
            };

            /**
             * Action whe user perform a pose.
             * If pose is lock/unlock pose (defined in options, default is 'thumb_to_pinky'), only lock/unlock is performed.
             * Else registered callbacks are called (see {Myo#on}).
             * @param data - websocket data
             */
            var triggerPose = function(data) {
                var device = devices.get(data.myo);
                if(device) {
                    $timeout.cancel(lockTimeouts.get(data.myo));

                    if(instanceOptions.lockUnlockPose === data.pose) {
                        lockUnlockDevice(device);

                    }
                    else if(!device.isLocked()) {
                        executeDevicePose(device, data);
                    }
                }
            };

            /**
             * Lock or unlock device only if user perform the pose during the pose time defined in options (defaut 500ms).
             * @param device - the {@link MyoDevice}
             */
            var lockUnlockDevice = function(device) {
                createTimeout(device.id, function() {
                    device.lockOrUnlock();

                    if(instanceOptions.broadcastOnLockUnlock) {
                        $rootScope.$broadcast('ngMyo' + (device.isLocked() ? 'Lock' : 'Unlock'), device.id);
                    }
                }, instanceOptions.lockUnlockPoseTime);
            };

            /**
             * Call device pose callbacks functions id the user perform the pose during the pose time defined in options (default 300ms)
             * @param device - the {@link MyoDevice}
             * @param data - the websocket message data
             */
            var executeDevicePose = function(device, data) {
                createTimeout(device.id, function() {
                    device.onPose(data);
                }, instanceOptions.poseTime);
            };

            /**
             * Create timeout for a device. The fn will be called after time ms
             * @param deviceId - the device id
             * @param fn - the callback function
             * @param time - the time to wait in ms
             */
            var createTimeout = function(deviceId, fn, time) {
                var timeoutPromise = $timeout(fn, time);
                lockTimeouts.set(deviceId, timeoutPromise);
            };
        };
    }

    angular.module('ngMyo')
        .service('Myo', ['$rootScope', '$window', '$timeout', 'MyoOptions', 'MyoOrientation', Myo]);
})();