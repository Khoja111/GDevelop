import optionalRequire from '../Utils/OptionalRequire.js';
const gd = global.gd;

//TODO: Update to ES6
function Bridge()
{
	this.net = optionalRequire('net');

	this.client = null;
	this.connected = false;
	this._onReceiveCb = null;
}

Bridge.prototype.isSupported = function() {
	return !!this.net;
}

Bridge.prototype.connectTo = function(port) {
	if (!this.net) return;

	var that = this;
	this.client = new this.net.Socket();
	this.client.connect(port, 'localhost', function() {
		console.log("Connection made on port", port);
		that.connected = true;
		if (that._onConnected) that._onConnected();
	});

	var data = "";
	this.client.on('data', function(dataBuffer) {
		data += dataBuffer;
		if (!dataBuffer.length || dataBuffer[dataBuffer.length - 1] == 0) {
			data = data.slice(0, -1); //Strip ending null character
			that._receive(data);
			data = "";
		}
	});

	this.client.on('close', function() {
		that.connected = false;
	});
}

Bridge.prototype.send = function(command, serializedObject, scope = "") {
	if (!this.connected) return false;

	var element = new gd.SerializerElement();
	element.addChild("command").setString(command);
	element.addChild("scope").setString(scope);
	element.addChild("payload");
	if (serializedObject) element.setChild("payload", serializedObject);

	var json = gd.Serializer.toJSON(element);
	element.delete();

	this.client.write(json + '\0');

	return true;
}

Bridge.prototype._receive = function(data) {
	console.log("Received data");

	// Parse the received JSON
	var t0 = performance.now();
	var dataObject;
	try {
		dataObject = JSON.parse(data);
	} catch(ex) {
		console.warn("Received invalid data (JSON parse failed)", ex);
		return;
	}
	var t1 = performance.now();

	// Transform the payload into a gd.SerializerElement
	// Note that gd.Serializer.fromJSObject returns a new gd.SerializerElement object at every call
	if (this._serializedObject) this._serializedObject.delete();
	this._serializedObject = gd.Serializer.fromJSObject(dataObject.payload);
	var t2 = performance.now();

	console.log("JSON parse took " + (t1 - t0) + " milliseconds.");
	console.log("Call to gd.Serializer.fromJSObject took " + (t2 - t1) + " milliseconds.");
	if (this._onReceiveCb) {
		this._onReceiveCb(dataObject.command, this._serializedObject, dataObject.scope);
	}
}

Bridge.prototype.onReceive = function(cb) {
	this._onReceiveCb = cb;
}

Bridge.prototype.onConnected = function(cb) {
	this._onConnected = cb;
}

export default Bridge;
