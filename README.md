ngMyo
=====

The ngMyo module allows you to use a Myo armband in desktop front end apps using angular.
It uses the thalmic lab Myo websocket api.

NgMyo calculate the roll/pitch/yaw for you (http://en.wikipedia.org/wiki/Flight_dynamics) which is easier to use than raw data.

## Installation

Using bower : 
```
bower install ng-myo --save
```

Otherwise : 
Get the last version of dist/ngMyo.js and include it to your application.

## How to use it

In your app.js

```javascript
angular.module('myAppModule', [
    'ngMyo',
    ...
  ])
});
```

In your controller
```javascript
function MyController(Myo) {
    Myo.on('fist', function() {
        console.log('fist');
        //do whatever you want on fist pose
    })
    .start();
}

angular.module('myAppModule').controller(['Myo', MyController]);
```

## Documentation

### Object and service

name        | description
------------|--------------------------------------------------------
MyoDevice | Representation of a myo armband device. Expose methods (see documentation below)
Myo | Angular service. It is the starting point that allows to configure and use ngMyo

### Methods

Myo (service) methods

name        | arguments                                              | description
------------|--------------------------------------------------------|------------
getDevice | myoId:Integer | Get the MyoDevice associated with provided id
getEventsForDevice | myoId:Integer | Get the Map of registered callbacks for the MyoDevice. Map key : event String, value : Array of callback functions
getOptions | _none_ | Get the options. See Myo options below
on | event:String, callback:Function, myoId:Integer(_Optional_) | Register a callback function that will be triggered when the event is triggered (see Myo events below).<br/>The myoId is optional. If provided, the callback will be attach to the designated MyoDevice, if not, it will be attached to the device 0. <br/>This method must be called before `start()`, otherwise the callback will not be taken into account.
start | options:Object(_Optional_) | Last function to call. It will connect to the websocket and register the MyoDevices. <br/>The options are optionals. If `undefined`, ngMyo will take default values (see Myo options below)

Myo events

name        | description                                            | Callback function arguments
------------|--------------------------------------------------------|----------------------------
orientation | The user move his arm. | device:MyoDevice, data:{accelerometer,gyroscope,orientation,rpy,rpyDiff}<ul>
* data.accelerometer: x,y,z - acceleration in G unit
* data.gyroscope: x,y,z - movement in rad/sec
* data.orientation: x,y,z,w - quaternion
* data.rpy: roll, pitch, yaw - calculated if the useRollPitchYaw option (see Myo Options below) is true.
* data.rpyDiff: roll, pitch, yaw - calculated diff if offset is defined in MyoDevice (see MyoDevice)</ul>
pose | The user execute a pose : 'thumb_to_pinky', 'fingers_spread', 'wave_in', 'wave_out', 'fist'. These values must be passed to Myo.on. Do not pass 'pose' to register a callback. | device:MyoDevice
arm_recognized | The user perform the arm recognized movement | device:MyoDevice
arm_lost | The armband has lost the arm recognition [ device:MyoDevice

Myo Options

name        | description                                            | Default value
------------|--------------------------------------------------------|--------------
broadcastOnConnected | Boolean. If ngMyo should broadcast ('ngMyoConnected', myoId) on device connection | true
broadcastOnDisconnected | Boolean. If ngMyo should broadcast ('ngMyoDisconnected', myoId) on device disconnection | true
broadcastOnLockUnlock | Boolean. If ngMyo should broadcast ('ngMyoLock'/'ngMyoUnlock', myoId) on device lock/unlock | true
skipOneOrientationEvery | Integer. The Myo armband trigger an orientation event every 20ms (on average). Depending on the callbacks, this can lead to performance issues. This option allows you to skip one event every {option} triggered event. | 2 (skip half of the events)
useRollPitchYaw | Boolean. If true, ngMyo will calculate roll/pitch/yaw and pass them to the orientation callback functions | true
rollPitchYawScale | Integer. Scale for roll/pitch/yaw. Each value will be between 0 and {option}. | 18
lockUnlockPose | String. Pose that will be used for lock/unlock device only. The registered callbacks for this pose event won't be triggered | 'thumb_to_pinky'
lockUnlockPoseTime | Integer. The number of milliseconds that the user must execute du lockUnlockPoseTime to lock/unlock the device | 500
poseTime | Integer. The number of milliseconds that the user must execute the pose to trigger the callbacks. This option limits the number of accidental pose. | 250

Myo device methods

name        | arguments                                             | description
------------|--------------------------------------------------------|--------------
incrementOrientationRequest | _none_ | This will return the current orientation request number and increment it internally. This is used by Myo service to test if orientation event should be skipped (see Myo options - skipOneOrientationEvery)
lock | _none_ | Lock the device and execute Myo armband short vibration twice. No event callback will be triggered until anymore until device unlock.
unlock | _none_ | Unlock the device and execute Myo armband medium vibration.
lockOrUnlock | _none_ | Call `lock()` if device is unlocked, `unlock()` otherwise
isLocked | _none_ | Test if the device is locked
vibrate | intensity:String(Optional) | Vibrate Myo armband with the provided intensity. The intensity must be 'short', 'medium' or 'long'. If not provided, the default value (medium) is used
rpyOffset | rpy:Object(Optional) | Getter (if rpy is not defined) and setter (if rpy is defined). Get/set the roll/pitch/yaw offset. rpy must contains 'roll', 'pitch' and 'yaw integer attributes. The rpyDiff will be calculated at each orientation event.
setLastRpyAsOffset | _none_ | Use last captured roll/pitch/yaw as offset. The rpyDiff will be calculated at each orientation event.
clearRpyOffset | _none_ | Clear the roll/pitch/yaw offset. The rpyDiff will not be calculated anymore.
direction | _none_ | Get the Myo armband direction. 1 if x_direction is toward_wrist, -1 if x_direction is toward_elbow
onOrientation | data:Object, rpy:Object, rpyDiff:Object | Trigger all 'orientation' callbacks with the provided values. Data must contains accelerometer, gyroscope and orientation. Rpy is the roll/pitch/yaw object. RpyDiff is the calculated roll/pitch/yaw diff.
onArmRecognized | data:Object | Set the direction using data.x_direction, and trigger all the 'arm_recongnized' callbacks
onArmLost | _none_ | Trigger all the 'arm_lost' callbacks
onPose | data:Object | Trigger all the data.pose callbacks. Data.pose must be ont of the Myo pose : : 'thumb_to_pinky', 'fingers_spread', 'wave_in', 'wave_out', 'fist'
