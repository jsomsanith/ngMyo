'use strict';

describe('ngMyo device', function() {
    describe('initialisation', function() {
        it('should set param values into instance attributes', function() {
            //given
            var id = 0;
            var version = '0.8.4';
            var ws = new WebSocketMock();
            var fnsByEvent = new Map();
            fnsByEvent.set('fist', [function(){}]);

            //when
            var myo = new MyoDevice(id, version, ws, fnsByEvent);

            //then
            expect(myo.id).toBe(id);
            expect(myo.version).toBe(version);
            expect(myo.ws).toBe(ws);
            expect(myo.fnsByEvent).toBe(fnsByEvent);
        });

        it('should set empty map in fnsByEvent if not defined', function() {
            //given
            var id = 0;
            var version = '0.8.4';
            var ws = new WebSocketMock();

            //when
            var myo = new MyoDevice(id, version, ws);

            //then
            expect(myo.id).toBe(id);
            expect(myo.version).toBe(version);
            expect(myo.ws).toBe(ws);
            expect(myo.fnsByEvent).toEqual(new Map());
        });
    });

    describe('with created MyoDevice', function() {
        var device, ws, orientationFn, armRecognizedFn, armLostFn, fistFn;
        var id = 0, version = '0.8.4';
        beforeEach(function() {
            orientationFn = jasmine.createSpy("orientationFn");
            armRecognizedFn = jasmine.createSpy("armRecognizedFn");
            armLostFn = jasmine.createSpy("armLostFn");
            fistFn = jasmine.createSpy("fistFn");
            ws = new WebSocketMock();

            var fnsByEvent = new Map();
            fnsByEvent.set('orientation', [orientationFn]);
            fnsByEvent.set('arm_recognized', [armRecognizedFn]);
            fnsByEvent.set('arm_lost', [armLostFn]);
            fnsByEvent.set('fist', [fistFn]);

            device = new MyoDevice(id, version, ws, fnsByEvent);

            spyOn(ws, 'send').and.callThrough();
            spyOn(device, 'vibrate').and.callThrough();
            spyOn(device, 'lock').and.callThrough();
            spyOn(device, 'unlock').and.callThrough();
        });

        describe('orientation request number', function() {
            it('should increment request number on each call', function() {
                //when
                var nb = device.incrementOrientationRequest();
                //then
                expect(nb).toBe(0);

                //when
                nb = device.incrementOrientationRequest();
                //then
                expect(nb).toBe(1);
            });
        });

        describe('lock', function() {
            it('should lock device', function() {
                //given
                expect(device.isLocked()).toBeFalsy();

                //when
                device.lock();

                //then
                expect(device.isLocked()).toBe(true);
                expect(ws.send).toHaveBeenCalledWith('["command",{"command":"lock","myo":0}]');
            });

            it('should unlock device', function() {
                //given
                device.setLock(true);

                //when
                device.unlock();

                //then
                expect(device.isLocked()).toBe(false);
                expect(ws.send).toHaveBeenCalledWith('["command",{"command":"unlock","myo":0,"type":"hold"}]');
            });

            it('should lock when device is unlocked', function() {
                //given

                //when
                device.lockOrUnlock();

                //then
                expect(device.isLocked()).toBe(true);
                expect(device.lock).toHaveBeenCalled();
            });

            it('should unlock when device is locked', function() {
                //given
                device.lock();

                //when
                device.lockOrUnlock();

                //then
                expect(device.isLocked()).toBe(false);
                expect(device.unlock).toHaveBeenCalled();
            });
        });

        describe('vibration', function() {
            it('should send vibrate with medium intensity by default', function() {
                //given

                //when
                device.vibrate();

                //then
                expect(ws.send).toHaveBeenCalledWith('["command",{"command":"vibrate","myo":0,"type":"medium"}]');
            });

            it('should send vibrate with intensity in arguments', function() {
                //given

                //when
                device.vibrate('long');

                //then
                expect(ws.send).toHaveBeenCalledWith('["command",{"command":"vibrate","myo":0,"type":"long"}]');
            });
        });

        describe('rpy offset', function() {
            it('should set/get offset depending on argument', function() {
                //given
                var rpy = {
                    roll: 1,
                    pitch: 0.5,
                    yaw: 0
                };
                expect(device.rpyOffset()).toBe(undefined);

                //when
                device.rpyOffset(rpy);

                //then
                expect(device.rpyOffset()).toBe(rpy);
            });

            it('should set last rpy as offset', function() {
                //given
                var rpy = {
                    roll: 1,
                    pitch: 0.5,
                    yaw: 0
                };
                device.onOrientation({}, rpy);
                expect(device.rpyOffset()).toBe(undefined);

                //when
                device.setLastRpyAsOffset();

                //then
                expect(device.rpyOffset()).toBe(rpy);
            });

            it('should set last rpy as offset', function() {
                //given
                var rpy = {
                    roll: 1,
                    pitch: 0.5,
                    yaw: 0
                };
                device.rpyOffset(rpy);

                //when
                device.clearRpyOffset();

                //then
                expect(device.rpyOffset()).toBe(undefined);
            });
        });

        describe('orientation', function() {
            it('should set lastRpy and call callbacks functions with orientation data', function() {
                //given
                var rpy = {
                    roll: 1,
                    pitch: 0.5,
                    yaw: 0
                };
                var rpyDiff = {
                    roll: 0.21344543,
                    pitch: 5.13045298,
                    yaw: -4.103495086
                };
                var data = {
                    accelerometer: {x: 1, y: 2, z: 3},
                    gyroscope: {x: 4, y: 5, z: 6},
                    orientation: {x: 7, y: 8, z: 9, w: 10}
                };

                var expectedOrientationData = {
                    accelerometer: data.accelerometer,
                    gyroscope: data.gyroscope,
                    orientation: data.orientation,
                    rpy: rpy,
                    rpyDiff: rpyDiff
                };

                //when
                device.onOrientation(data, rpy, rpyDiff);

                //then
                expect(orientationFn).toHaveBeenCalledWith(device, expectedOrientationData);
            });

            it('should only set lastRpy if no callback on orientation', function() {
                //given
                var rpy = {
                    roll: 1,
                    pitch: 0.5,
                    yaw: 0
                };
                var rpyDiff = {
                    roll: 0.21344543,
                    pitch: 5.13045298,
                    yaw: -4.103495086
                };
                var data = {
                    accelerometer: {x: 1, y: 2, z: 3},
                    gyroscope: {x: 4, y: 5, z: 6},
                    orientation: {x: 7, y: 8, z: 9, w: 10}
                };

                //when
                new MyoDevice(id, version, ws).onOrientation(data, rpy, rpyDiff);

                //then
                expect(orientationFn).not.toHaveBeenCalled();
            });

            it('should set direction to -1 with toward_elbow device direction and call armRecognized callbacks', function() {
                //given
                var data = {x_direction: 'toward_elbow'};

                //when
                device.onArmRecognized(data);

                //then
                expect(armRecognizedFn).toHaveBeenCalledWith(device);
                expect(device.direction()).toBe(-1);
            });

            it('should set direction to 1 with toward_wrist device direction and call armRecognized callbacks', function() {
                //given
                var data = {x_direction: 'toward_wrist'};

                //when
                device.onArmRecognized(data);

                //then
                expect(armRecognizedFn).toHaveBeenCalledWith(device);
                expect(device.direction()).toBe(1);
            });

            it('should not set direction and call armRecognized callbacks', function() {
                //given
                var data = {};

                //when
                device.onArmRecognized(data);

                //then
                expect(armRecognizedFn).toHaveBeenCalledWith(device);
                expect(device.direction()).toBe(undefined);
            });

            it('should call armLost callbacks', function() {
                //given

                //when
                device.onArmLost();

                //then
                expect(armLostFn).toHaveBeenCalledWith(device);
            });
        });

        describe('orientation', function() {
            it('should call pose callbacks', function() {
                //given
                var data = {pose: 'fist'};

                //when
                device.onPose(data);

                //then
                expect(fistFn).toHaveBeenCalledWith(device);
            });

            it('should do nothing when no callback is defined', function() {
                //given
                var data = {pose: 'rest'};

                //when
                device.onPose(data);

                //then
                expect(armRecognizedFn).not.toHaveBeenCalled();
                expect(armLostFn).not.toHaveBeenCalled();
                expect(orientationFn).not.toHaveBeenCalled();
                expect(fistFn).not.toHaveBeenCalled();
            });
        });
    });
});