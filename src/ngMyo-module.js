'use strict';

(function() {
   angular.module('ngMyo', [])
       .constant('MyoOptions', {
           wsUrl:                   'ws://127.0.0.1:10138/myo/',
           apiVersion:              2,
           timeBeforeReconnect :    3000,

           autoApply :              true,

           skipOneOrientationEvery: 2,
           useRollPitchYaw:         true,
           rollPitchYawScale:       18,

           broadcastOnConnected:    true,
           broadcastOnDisconnected: true,
           broadcastOnLockUnlock:   true,

           lockUnlockPose:          'thumb_to_pinky',
           lockUnlockPoseTime:      500,
           poseTime:                250
       });
})();