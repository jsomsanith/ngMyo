'use strict';

(function () {
  function MyoOrientation() {
    /**
     * Calculate the roll, pitch and yaw from orientation quanternion
     *
     * @param quat - a quaternion
     * @param scale - the scale (roll, pitch and yaw will be within [0, scale]
     * @param direction - the myo device x_direction. 1 : myo orientation 'toward_wrist', -1 : myo orientation 'toward_elbow'
     * @returns {{roll: number, pitch: number, yaw: number}}
     */
    this.calculateRPY = function (quat, scale, direction) {
      var rpyRad = {
        roll: Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x * quat.x + quat.y * quat.y)),
        pitch: Math.asin(Math.max(-1, Math.min(1, 2 * (quat.w * quat.y - quat.z * quat.x)))),
        yaw: Math.atan2(2 * (quat.w * quat.z + quat.x * quat.y), 1 - 2 * (quat.y * quat.y + quat.z * quat.z))
      };

      return {
        roll: (rpyRad.roll + Math.PI) / (Math.PI * 2) * scale * direction,
        pitch: (rpyRad.pitch + Math.PI / 2) / Math.PI * scale * direction,
        yaw: (rpyRad.yaw + Math.PI) / (Math.PI * 2) * scale
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
    this.calculateRPYDiff = function (rpy, rpyOffset, rpyScale) {
      var roll = adaptWithScale(rpy.roll - rpyOffset.roll, rpyScale);
      var pitch = adaptWithScale(rpyOffset.pitch - rpy.pitch, rpyScale);
      var yaw = adaptWithScale(rpyOffset.yaw - rpy.yaw, rpyScale);

      return {
        roll: roll,
        pitch: pitch,
        yaw: yaw
      };
    };

    var adaptWithScale = function (value, scale) {
      var threashold = scale / 2;
      if (value > threashold) {
        return value - scale;
      }
      else if (value < -threashold) {
        return value + scale;
      }
      else {
        return value;
      }
    };
  }

  angular.module('ngMyo')
    .service('MyoOrientation', [MyoOrientation]);
})();
