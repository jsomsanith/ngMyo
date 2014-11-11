'use strict';

describe('ngMyo orientation Service', function() {
    beforeEach(module('ngMyo'));

    describe('calculateRPY from quaternion and scale', function() {
        it('should calculate starting roll/pitch/yaw', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: 0,
                y: 0,
                z: 0,
                w: 0
            };
            var scale = 18;
            var expectedRPY = {
                roll: scale/2,
                pitch: scale/2,
                yaw: scale/2
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));

        it('should calculate negative roll limit', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: -1,
                y: 0,
                z: 0,
                w: 0
            };
            var scale = 18;
            var expectedRPY = {
                roll: scale,
                pitch: scale/2,
                yaw: scale/2
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));

        it('should calculate positive roll limit', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: 1,
                y: 0,
                z: 0,
                w: 0
            };
            var scale = 18;
            var expectedRPY = {
                roll: scale,
                pitch: scale/2,
                yaw: scale/2
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));

        it('should calculate negative pitch limit', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: 0,
                y: -1,
                z: 0,
                w: 0
            };
            var scale = 18;
            var expectedRPY = {
                roll: scale,
                pitch: scale/2,
                yaw: scale
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));

        it('should calculate positive pitch limit', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: 0,
                y: 1,
                z: 0,
                w: 0
            };
            var scale = 18;
            var expectedRPY = {
                roll: scale,
                pitch: scale/2,
                yaw: scale
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));

        it('should calculate negative yaw limit', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: 0,
                y: 0,
                z: -1,
                w: 0
            };
            var scale = 18;
            var expectedRPY = {
                roll: scale/2,
                pitch: scale/2,
                yaw: scale
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));

        it('should calculate positive yaw limit', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: 0,
                y: 0,
                z: 1,
                w: 0
            };
            var scale = 18;
            var expectedRPY = {
                roll: scale/2,
                pitch: scale/2,
                yaw: scale
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));

        it('should calculate roll/pitch/yaw', inject(function(MyoOrientation) {
            //given
            var quaternion = {
                x: 0.3,
                y: 0.2,
                z: -0.52,
                w: 0.3
            };
            var scale = 18;
            var expectedRPY = {
                roll: 8.891654265840668,
                pitch: 11.559455227837645,
                yaw: 7.657278932974071
            };

            //when
            var rpy = MyoOrientation.calculateRPY(quaternion, scale);

            //then
            expect(rpy).toEqual(expectedRPY);
        }));
    });

    describe('calculateRPYDiff', function() {
        it('should calculate diff with myo x_direction toward_wrist', inject(function (MyoOrientation) {
            //given
            var rpy = {
                roll: 17.534562342,
                pitch: 10.23485503,
                yaw: 8.130458086
            };
            var rpyOffset = {
                roll: 16.394534859,
                pitch: 10.595839682,
                yaw: 11.308240394
            };
            var rpyScale = 18;
            var direction = 1;

            var expectedRoundedDiff = {
                roll: 1.140027483,
                pitch: 0.360984652,
                yaw: 3.177782308
            };

            //when
            var diff = MyoOrientation.calculateRPYDiff(rpy, rpyOffset, rpyScale, direction);

            //then
            var roundedDiff = {
                roll: Math.round(diff.roll * 10000000000) / 10000000000,
                pitch: Math.round(diff.pitch * 10000000000) / 10000000000,
                yaw: Math.round(diff.yaw * 10000000000) / 10000000000
            };
            expect(roundedDiff).toEqual(expectedRoundedDiff);
        }));

        it('should calculate diff with myo x_direction toward_elbow', inject(function (MyoOrientation) {
            //given
            var rpy = {
                roll: 17.534562342,
                pitch: 10.23485503,
                yaw: 8.130458086
            };
            var rpyOffset = {
                roll: 16.394534859,
                pitch: 10.595839682,
                yaw: 11.308240394
            };
            var rpyScale = 18;
            var direction = -1;

            var expectedRoundedDiff = {
                roll: -1.140027483,
                pitch: -0.360984652,
                yaw: 3.177782308
            };

            //when
            var diff = MyoOrientation.calculateRPYDiff(rpy, rpyOffset, rpyScale, direction);

            //then
            var roundedDiff = {
                roll: Math.round(diff.roll * 10000000000) / 10000000000,
                pitch: Math.round(diff.pitch * 10000000000) / 10000000000,
                yaw: Math.round(diff.yaw * 10000000000) / 10000000000
            };
            expect(roundedDiff).toEqual(expectedRoundedDiff);
        }));

        it('should take into account the max value threashold. After rpyScale, value restart from 0 and after 0 value start from rpyScale', inject(function (MyoOrientation) {
            //given
            var rpy = {
                roll: 17.534562342,
                pitch: 16.23485503,
                yaw: 16.130458086
            };
            var rpyOffset = {
                roll: 1.498503019,
                pitch: 15.595839682,
                yaw: 1.308240394
            };
            var rpyScale = 18;
            var direction = 1;

            var expectedRoundedDiff = {
                roll: -1.963940677,
                pitch: -0.639015348,
                yaw: 3.177782308
            };

            //when
            var diff = MyoOrientation.calculateRPYDiff(rpy, rpyOffset, rpyScale, direction);

            //then
            var roundedDiff = {
                roll: Math.round(diff.roll * 10000000000) / 10000000000,
                pitch: Math.round(diff.pitch * 10000000000) / 10000000000,
                yaw: Math.round(diff.yaw * 10000000000) / 10000000000
            };
            expect(roundedDiff).toEqual(expectedRoundedDiff);
        }));
    });
});