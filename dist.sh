#!/bin/sh
rm dist/ngMyo.js
browserify src/ngMyo-device.js src/ngMyo-module.js src/ngMyo-orientation-service.js src/ngMyo-service.js -o dist/ngMyo.js
