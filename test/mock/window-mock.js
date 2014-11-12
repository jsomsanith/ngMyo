'use strict';

function WindowMock() {
	this.WebSocket = function(url) {
		console.log('New websocket with url = ' + url);
		return webSocketServerMock;
	}
}

function WindowWithoutWebsocketMock() {
}