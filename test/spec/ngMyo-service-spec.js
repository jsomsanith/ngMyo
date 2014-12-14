'use strict';

describe('ngMyo Service', function() {
    beforeEach(module('ngMyo'));

    describe('.on()', function() {
        it('should register event', inject(function(Myo) {
            //given
	        var callbackFn = function() {};

            //when
	        Myo.on('fist', callbackFn, 1);

            //then
	        var events = Myo.getEventsForDevice(1);
	        expect(events.get('fist')).toContain(callbackFn);
        }));

        it('should register event with default myo ID', inject(function(Myo) {
	        //given
	        var callbackFn = function() {};

	        //when
	        Myo.on('fist', callbackFn);

	        //then
	        var events = Myo.getEventsForDevice(0);
	        expect(events.get('fist')).toContain(callbackFn);
        }));
    });

	describe('with no websocket supported', function() {
		beforeEach(function() {
			module(function ($provide) {
				$provide.value('$window', new WindowWithoutWebsocketMock());
			});
		});

		it('should throw error on start', inject(function(Myo) {
			//when
			var startFn = Myo.start;

			//then
			expect(function() {startFn();}).toThrow(new Error('Socket not supported by browser'));
		}));
	});

	describe('options on .start()', function() {
		beforeEach(function() {
			module(function ($provide) {
				$provide.value('$window', new WindowMock());
			});
		});

        it('should take custom wsUrl option', inject(function(Myo) {
            //given
            var options = {
                wsUrl: 'ws://125.125.125.125:11111/myo'
            };

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.wsUrl).toBe('ws://125.125.125.125:11111/myo');
        }));

        it('should take default wsUrl option when not defined in custom options', inject(function(Myo) {
            //given
            var options = {};

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.wsUrl).toBe('ws://127.0.0.1:10138/myo/');
        }));

        it('should take custom apiVersion option', inject(function(Myo) {
            //given
            var options = {
                apiVersion: 5
            };

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.apiVersion).toBe(5);
        }));

        it('should take default apiVersion option when not defined in custom options', inject(function(Myo) {
            //given
            var options = {};

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.apiVersion).toBe(3);
        }));

		it('should take custom useRollPitchYaw option', inject(function(Myo) {
			//given
			var options = {
				useRollPitchYaw: false
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.useRollPitchYaw).toBe(false);
		}));

		it('should take default useRollPitchYaw option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.useRollPitchYaw).toBe(true);
		}));

		it('should take custom rollPitchYawScale option', inject(function(Myo) {
			//given
			var options = {
				rollPitchYawScale: 6
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.rollPitchYawScale).toBe(6);
		}));

		it('should take default rollPitchYawScale option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.rollPitchYawScale).toBe(18);
		}));

		it('should take custom broadcastOnConnected option', inject(function(Myo) {
			//given
			var options = {
				broadcastOnConnected: false
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.broadcastOnConnected).toBe(false);
		}));

		it('should take default broadcastOnConnected option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.broadcastOnConnected).toBe(true);
		}));

		it('should take custom broadcastOnDisconnected option', inject(function(Myo) {
			//given
			var options = {
				broadcastOnDisconnected: false
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.broadcastOnDisconnected).toBe(false);
		}));

		it('should take default broadcastOnDisconnected option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.broadcastOnDisconnected).toBe(true);
		}));

		it('should take custom broadcastOnLockUnlock option', inject(function(Myo) {
			//given
			var options = {
				broadcastOnLockUnlock: false
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.broadcastOnLockUnlock).toBe(false);
		}));

		it('should take default broadcastOnLockUnlock option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.broadcastOnLockUnlock).toBe(true);
		}));

		it('should take custom skipOneOrientationEvery option', inject(function(Myo) {
			//given
			var options = {
				skipOneOrientationEvery: 3
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.skipOneOrientationEvery).toBe(3);
		}));

		it('should take default skipOneOrientationEvery option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.skipOneOrientationEvery).toBe(2);
		}));

		it('should take default skipOneOrientationEvery option when it is not an integer in custom options', inject(function(Myo) {
			//given
			var options = {
				skipOneOrientationEvery: 'aze'
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.skipOneOrientationEvery).toBe(2);
		}));

		it('should take custom lockUnlockPose option', inject(function(Myo) {
			//given
			var options = {
				lockUnlockPose: 'fist'
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.lockUnlockPose).toEqual('fist');
		}));

		it('should take default lockUnlockPose option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.lockUnlockPose).toEqual('thumb_to_pinky');
		}));

		it('should take custom lockUnlockPoseTime option', inject(function(Myo) {
			//given
			var options = {
				lockUnlockPoseTime: 1000
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.lockUnlockPoseTime).toBe(1000);
		}));

		it('should take default lockUnlockPoseTime option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.lockUnlockPoseTime).toBe(500);
		}));

		it('should take default lockUnlockPoseTime option when it is not an integer in custom options', inject(function(Myo) {
			//given
			var options = {
				lockUnlockPoseTime: 'aze'
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.lockUnlockPoseTime).toBe(500);
		}));

		it('should take custom poseTime option', inject(function(Myo) {
			//given
			var options = {
				poseTime: 1000
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.poseTime).toBe(1000);
		}));

		it('should take default poseTime option when not defined in custom options', inject(function(Myo) {
			//given
			var options = {};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.poseTime).toBe(250);
		}));

		it('should take default poseTime option when it is not an integer in custom options', inject(function(Myo) {
			//given
			var options = {
				poseTime: 'aze'
			};

			//when
			Myo.start(options);

			//then
			var instanceOptions = Myo.getOptions();
			expect(instanceOptions.poseTime).toBe(250);
		}));

        it('should take custom lockUnlockPoseTime option', inject(function(Myo) {
            //given
            var options = {
                timeBeforeReconnect: 1000
            };

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.timeBeforeReconnect).toBe(1000);
        }));

        it('should take default timeBeforeReconnect option when not defined in custom options', inject(function(Myo) {
            //given
            var options = {};

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.timeBeforeReconnect).toBe(3000);
        }));

        it('should take default timeBeforeReconnect option when it is not an integer in custom options', inject(function(Myo) {
            //given
            var options = {
                timeBeforeReconnect: 'aze'
            };

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.timeBeforeReconnect).toBe(3000);
        }));

        it('should take custom autoApply option', inject(function(Myo) {
            //given
            var options = {
                autoApply: false
            };

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.autoApply).toBe(false);
        }));

        it('should take default autoApply option when not defined in custom options', inject(function(Myo) {
            //given
            var options = {};

            //when
            Myo.start(options);

            //then
            var instanceOptions = Myo.getOptions();
            expect(instanceOptions.autoApply).toBe(true);
        }));

		it('should take default options when no custom options is provided', inject(function(Myo, MyoOptions) {
			//when
			Myo.start();

			//then
			expect(Myo.getOptions()).toBe(MyoOptions);
		}));
	});

    describe('websocket connection', function() {
        beforeEach(function() {
            module(function ($provide) {
                $provide.value('$window', new WindowMock());
            });

        });
        beforeEach(inject(function ($rootScope, $window) {
            spyOn($rootScope, '$broadcast').and.callThrough();
            spyOn($rootScope, '$digest').and.callThrough();
            spyOn($window, 'WebSocket').and.callThrough();
        }));

        it('should broadcast ngMyoStarted and call digest on ws open', inject(function ($rootScope, Myo) {
            //given
            Myo.start({autoApply: true});

            //when
            webSocketServerMock.onopen();

            //then
            expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoStarted');
            expect($rootScope.$digest).toHaveBeenCalled();
        }));

        it('should broadcast ngMyoStarted but not call digest on ws open with false autoApply option', inject(function ($rootScope, Myo) {
            //given
            Myo.start({autoApply: false});

            //when
            webSocketServerMock.onopen();

            //then
            expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoStarted');
            expect($rootScope.$digest).not.toHaveBeenCalled();
        }));

        it('should broadcast ngMyoStarted but not call digest on ws open if digest is in progress', inject(function ($rootScope, Myo) {
            //given
            Myo.start({autoApply: true});
            $rootScope.$$phase = true;

            //when
            webSocketServerMock.onopen();

            //then
            expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoStarted');
            expect($rootScope.$digest).not.toHaveBeenCalled();
        }));

        it('should broadcast ngMyoClosed and call digest on ws close', inject(function ($rootScope, Myo) {
            //given
            Myo.start({autoApply: true});

            //when
            webSocketServerMock.onclose();

            //then
            expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoClosed');
            expect($rootScope.$digest).toHaveBeenCalled();
        }));

        it('should broadcast ngMyoClosed but not call digest on ws close with false autoApply option', inject(function ($rootScope, Myo) {
            //given
            Myo.start({autoApply: false});

            //when
            webSocketServerMock.onclose();

            //then
            expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoClosed');
            expect($rootScope.$digest).not.toHaveBeenCalled();
        }));

        it('should broadcast ngMyoClosed but not call digest on ws close if digest is in progress', inject(function ($rootScope, Myo) {
            //given
            Myo.start({autoApply: true});
            $rootScope.$$phase = true;

            //when
            webSocketServerMock.onclose();

            //then
            expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoClosed');
            expect($rootScope.$digest).not.toHaveBeenCalled();
        }));

        it('should attempt reconnection on ws close after timeBeforeReconnect option timeout', inject(function ($rootScope, $window, $timeout, Myo) {
            //given
            Myo.start({timeBeforeReconnect: 5000});

            //when
            webSocketServerMock.onclose();
            $timeout.flush();

            //then
            expect($window.WebSocket.calls.count()).toBe(2);
        }));
    });

	describe('on websocket message', function() {
		beforeEach(function() {
			module(function ($provide) {
				$provide.value('$window', new WindowMock());
			});

		});
		beforeEach(inject(function ($rootScope) {
			spyOn($rootScope, '$broadcast').and.callThrough();
		}));

		it('should register MyoDevice on "connected" and broadcast event', inject(function ($rootScope, Myo) {
			//given
			var fistCallbackFn = function() {};
			Myo.start({broadcastOnConnected: true});
			Myo.on('fist', fistCallbackFn);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});

			//then
			expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoConnected', 0);
			var device = Myo.getDevice(0);
			expect(device.fnsByEvent.get('fist')).toContain(fistCallbackFn);
			expect(device.id).toBe(0);
			expect(device.version).toBe('0.8.45');
			expect(device.ws).toBe(webSocketServerMock);
		}));

		it('should register MyoDevice on "connected" and not broadcast event', inject(function ($rootScope, Myo) {
			//given
			var fistCallbackFn = function() {};
			Myo.start({broadcastOnConnected: false});
			Myo.on('fist', fistCallbackFn);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});

			//then
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
			var device = Myo.getDevice(0);
			expect(device.fnsByEvent.get('fist')).toContain(fistCallbackFn);
			expect(device.id).toBe(0);
			expect(device.version).toBe('0.8.45');
			expect(device.ws).toBe(webSocketServerMock);
		}));

		it('should unregister MyoDevice on "disconnected" and broadcast event', inject(function ($rootScope, Myo) {
			//given
			Myo.start({broadcastOnConnected: false, broadcastOnDisconnected: true});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			expect(Myo.getDevice(0)).toBeTruthy();

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'disconnected',
				myo: 0
			}])});

			//then
			expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoDisconnected', 0);
			expect(Myo.getDevice(0)).toBeFalsy();
		}));

		it('should unregister MyoDevice on "disconnected" and not broadcast event', inject(function ($rootScope, Myo) {
			//given
			Myo.start({broadcastOnConnected: false, broadcastOnDisconnected: false});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			expect(Myo.getDevice(0)).toBeTruthy();

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'disconnected',
				myo: 0
			}])});

			//then
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
			expect(Myo.getDevice(0)).toBeFalsy();
		}));

		it('should call registered callback on arm_recognized when device is registered', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start({broadcastOnConnected: false, broadcastOnDisconnected: false});
			Myo.on('arm_recognized', callbackFn);

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'arm_recognized',
				myo: 0
			}])});

			//then
			expect(callbackFn).toHaveBeenCalledWith(Myo.getDevice(0));
		}));

		it('should do nothing on arm_recognized when device is not registered', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start({broadcastOnConnected: false, broadcastOnDisconnected: false});
			Myo.on('arm_recognized', callbackFn);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'arm_recognized',
				myo: 0
			}])});

			//then
			expect(callbackFn).not.toHaveBeenCalledWith();
		}));

		it('should call registered callback on arm_lost when device is registered', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start({broadcastOnConnected: false, broadcastOnDisconnected: false});
			Myo.on('arm_lost', callbackFn);

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'arm_lost',
				myo: 0
			}])});

			//then
			expect(callbackFn).toHaveBeenCalledWith(Myo.getDevice(0));
		}));

		it('should do nothing on arm_lost when device is not registered', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start({broadcastOnConnected: false, broadcastOnDisconnected: false});
			Myo.on('arm_lost', callbackFn);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'arm_lost',
				myo: 0
			}])});

			//then
			expect(callbackFn).not.toHaveBeenCalledWith();
		}));

		it('should call registered callback with a timeout on pose when device is registered and unlocked', inject(function ($timeout, Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start({
				lockUnlockPose: 'thumb_to_pinky',
				poseTime: 300
			});
			Myo.on('fist', callbackFn);

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'fist',
				myo: 0
			}])});
			$timeout.flush(300);

			//then
			expect(callbackFn).toHaveBeenCalledWith(Myo.getDevice(0));
		}));

		it('should do nothing on pose when device is registered but locked', inject(function ($timeout, Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start({
				lockUnlockPose: 'thumb_to_pinky',
				poseTime: 300
			});
			Myo.on('fist', callbackFn);

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			Myo.getDevice(0).lock();

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'fist',
				myo: 0
			}])});
			$timeout.flush(300);

			//then
			expect(callbackFn).not.toHaveBeenCalled();
		}));

		it('should do nothing on pose when device is not registered', inject(function ($timeout, Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start({
				lockUnlockPose: 'thumb_to_pinky',
				poseTime: 300
			});
			Myo.on('fist', callbackFn);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'fist',
				myo: 0
			}])});
			$timeout.flush(300);

			//then
			expect(callbackFn).not.toHaveBeenCalledWith();
		}));

		it('should lock device with a timeout and broadcast event on lock pose when device is registered and unlocked', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				lockUnlockPose: 'thumb_to_pinky',
				lockUnlockPoseTime: 500,
				broadcastOnLockUnlock: true
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			expect(Myo.getDevice(0).isLocked()).toBe(false);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'thumb_to_pinky',
				myo: 0
			}])});
			$timeout.flush(500);

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoLock', 0);
		}));

		it('should lock device with a timeout and not broadcast event on lock pose when device is registered and unlocked', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				broadcastOnConnected: false,
				lockUnlockPose: 'thumb_to_pinky',
				lockUnlockPoseTime: 500,
				broadcastOnLockUnlock: false
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			expect(Myo.getDevice(0).isLocked()).toBe(false);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'thumb_to_pinky',
				myo: 0
			}])});
			$timeout.flush(500);

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(true);
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
		}));

		it('should unlock device with a timeout and broadcast event on lock pose when device is registered and locked', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				lockUnlockPose: 'thumb_to_pinky',
				lockUnlockPoseTime: 500,
				broadcastOnLockUnlock: true
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			Myo.getDevice(0).lock();
			expect(Myo.getDevice(0).isLocked()).toBe(true);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'thumb_to_pinky',
				myo: 0
			}])});
			$timeout.flush(500);

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoUnlock', 0);
		}));

		it('should unlock device with a timeout and not broadcast event on lock pose when device is registered and locked', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				broadcastOnConnected: false,
				lockUnlockPose: 'thumb_to_pinky',
				lockUnlockPoseTime: 500,
				broadcastOnLockUnlock: false
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			Myo.getDevice(0).lock();
			expect(Myo.getDevice(0).isLocked()).toBe(true);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'thumb_to_pinky',
				myo: 0
			}])});
			$timeout.flush(500);

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(false);
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
		}));

		it('should do nothing on pose lock when device is not registered', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				lockUnlockPose: 'thumb_to_pinky',
				lockUnlockPoseTime: 500
			});

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'thumb_to_pinky',
				myo: 0
			}])});
			$timeout.flush(500);

			//then
			//no crash
		}));

		it('should do nothing on orientation when device is not registered', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.start();
			Myo.on('orientation', callbackFn);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'orientation',
				myo: 0
			}])});

			//then
			expect(callbackFn).not.toHaveBeenCalled();
		}));

		it('should do nothing on orientation when device locked', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.on('orientation', callbackFn);
			Myo.start();
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			Myo.getDevice(0).lock();

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'orientation',
				myo: 0
			}])});

			//then
			expect(callbackFn).not.toHaveBeenCalled();
		}));

		it('should do nothing on orientation when should skip orientation', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.on('orientation', callbackFn);
			Myo.start({
				skipOneOrientationEvery: 1
			});
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'orientation',
				myo: 0
			}])});

			//then
			expect(callbackFn).not.toHaveBeenCalled();
		}));

		it('should not calculate roll/pitch/yaw on orientation', inject(function (Myo) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.on('orientation', callbackFn);
			Myo.start({
				useRollPitchYaw: false
			});
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			spyOn(Myo.getDevice(0), 'onOrientation').and.callThrough();

			var data = {
				type: 'orientation',
				myo: 0
			};

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event', {type: 'orientation', myo: 0}])});
			webSocketServerMock.onmessage({data: JSON.stringify(['event', data])});

			//then
			expect(callbackFn).toHaveBeenCalled();
			expect(Myo.getDevice(0).onOrientation).toHaveBeenCalledWith(data, undefined, undefined);
		}));

		it('should calculate roll/pitch/yaw on orientation but not diff', inject(function (Myo, MyoOrientation) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.on('orientation', callbackFn);
			Myo.start({
				useRollPitchYaw: true,
				rollPitchYawScale: 18
			});
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
            webSocketServerMock.onmessage({data: JSON.stringify(['event',{
                type: 'arm_recognized',
                myo: 0,
                x_direction: 'toward_elbow'
            }])});

			var data = {
				type: 'orientation',
				orientation: {x: 1, y: 1, z: 1, w: 0},
				myo: 0
			};
			var rpy = {
				roll: 1,
				pitch: 1,
				yaw: 1
			};
			var rpyDiff = {
				roll: 2,
				pitch: 2,
				yaw: 2
			};

			spyOn(Myo.getDevice(0), 'onOrientation').and.callThrough();
			spyOn(MyoOrientation, 'calculateRPY').and.returnValue(rpy);
			spyOn(MyoOrientation, 'calculateRPYDiff').and.returnValue(rpyDiff);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event', {type: 'orientation', myo: 0}])});
			webSocketServerMock.onmessage({data: JSON.stringify(['event', data])});

			//then
			expect(callbackFn).toHaveBeenCalled();
			expect(MyoOrientation.calculateRPY).toHaveBeenCalledWith(data.orientation, 18, -1);
			expect(MyoOrientation.calculateRPYDiff).not.toHaveBeenCalled();
			expect(Myo.getDevice(0).onOrientation).toHaveBeenCalledWith(data, rpy, undefined);
		}));

		it('should calculate roll/pitch/yaw and diff on orientation', inject(function (Myo, MyoOrientation) {
			//given
			var callbackFn = jasmine.createSpy("callbackFn");
			Myo.on('orientation', callbackFn);
			Myo.start({
				useRollPitchYaw: true,
				rollPitchYawScale: 18
			});
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'arm_recognized',
				myo: 0,
				x_direction: 'toward_elbow'
			}])});

			var data = {
				type: 'orientation',
				orientation: {x: 1, y: 1, z: 1, w: 0},
				myo: 0
			};
			var rpy = {
				roll: 1,
				pitch: 1,
				yaw: 1
			};
			var rpyDiff = {
				roll: 2,
				pitch: 2,
				yaw: 2
			};
			var offset = {
				roll: 3,
				pitch: 3,
				yaw: 3
			};

			Myo.getDevice(0).rpyOffset(offset);

			spyOn(Myo.getDevice(0), 'onOrientation').and.callThrough();
			spyOn(MyoOrientation, 'calculateRPY').and.returnValue(rpy);
			spyOn(MyoOrientation, 'calculateRPYDiff').and.returnValue(rpyDiff);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event', {type: 'orientation', myo: 0}])});
			webSocketServerMock.onmessage({data: JSON.stringify(['event', data])});

			//then
			expect(callbackFn).toHaveBeenCalled();
			expect(MyoOrientation.calculateRPY).toHaveBeenCalledWith(data.orientation, 18, -1);
			expect(MyoOrientation.calculateRPYDiff).toHaveBeenCalledWith(rpy, offset, 18);
			expect(Myo.getDevice(0).onOrientation).toHaveBeenCalledWith(data, rpy, rpyDiff);
		}));

		it('should calculate roll/pitch/yaw and diff on orientation', inject(function (Myo) {
			//given
			Myo.start();

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['else', {}])});

			//then
			//no crash
		}));

		/////////////////////////////////////////////////////////////////////////////////////////
		it('should call lock device and broadcast event on double_tap when device is registered and unlocked', inject(function ($rootScope, Myo) {
			//given
			Myo.start({
				lockUnlockPoseTime: 500,
				broadcastOnLockUnlock: true
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			expect(Myo.getDevice(0).isLocked()).toBe(false);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'double_tap',
				myo: 0
			}])});

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoLock', 0);
		}));

		it('should lock device with a timeout and not broadcast event on double_tap pose when device is registered and unlocked', inject(function ($rootScope, Myo) {
			//given
			Myo.start({
				broadcastOnConnected: false,
				lockUnlockPose: 'thumb_to_pinky',
				lockUnlockPoseTime: 500,
				broadcastOnLockUnlock: false
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			expect(Myo.getDevice(0).isLocked()).toBe(false);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'pose',
				pose: 'double_tap',
				myo: 0
			}])});

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(true);
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
		}));

		it('should unlock device programatically and broadcast event on hardware unlock event when device is registered and locked', inject(function ($rootScope, Myo) {
			//given
			Myo.start({
				broadcastOnLockUnlock: true
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			Myo.getDevice(0).lock();
			expect(Myo.getDevice(0).isLocked()).toBe(true);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'unlocked',
				myo: 0
			}])});

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith('ngMyoUnlock', 0);
		}));

		it('should unlock device programatically and not broadcast event on hardware unlock event when device is registered and locked', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				broadcastOnConnected: false,
				broadcastOnLockUnlock: false
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			Myo.getDevice(0).lock();
			expect(Myo.getDevice(0).isLocked()).toBe(true);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'unlocked',
				myo: 0
			}])});

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(false);
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
		}));

		it('should do nothing on hardware unlock event when device is already unlocked', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				broadcastOnConnected: false,
				broadcastOnLockUnlock: true
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			expect(Myo.getDevice(0).isLocked()).toBe(false);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'unlocked',
				myo: 0
			}])});

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(false);
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
		}));

		it('should do nothing on hardware unlock event when device is not registered', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				broadcastOnConnected: false,
				broadcastOnLockUnlock: true
			});

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'unlocked',
				myo: 0
			}])});

			//then
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
		}));

		it('should do nothing on hardware lock event when device is already locked', inject(function ($rootScope, $timeout, Myo) {
			//given
			Myo.start({
				broadcastOnConnected: false,
				broadcastOnLockUnlock: true
			});

			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'connected',
				myo: 0,
				version: [0, 8, 45]
			}])});
			Myo.getDevice(0).lock();
			expect(Myo.getDevice(0).isLocked()).toBe(true);

			//when
			webSocketServerMock.onmessage({data: JSON.stringify(['event',{
				type: 'locked',
				myo: 0
			}])});

			//then
			expect(Myo.getDevice(0).isLocked()).toBe(true);
			expect($rootScope.$broadcast).not.toHaveBeenCalled();
		}));
	});
});