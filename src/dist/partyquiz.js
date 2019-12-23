"use strict";
var Client = /** @class */ (function () {
    function Client() {
        var _this = this;
        this.sendMessage = function (ev) {
            console.log(ev);
            if (ev.keyCode == 13) {
                var t = ev.target;
                var msg = t.value.split("\n").pop();
                _this.dataChannel.send(msg);
            }
        };
        Log("Joining ...");
        var offer = JSON.parse(prompt("Paste connection string") || "");
        var peerConn = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });
        peerConn.ondatachannel = function (e) {
            _this.dataChannel = e.channel;
            _this.dataChannel.onopen = function (e) {
                _this.dataChannel.send("Connected");
            };
            _this.dataChannel.onmessage = function (e) { Log('Got message:', e.data); };
        };
        peerConn.onicecandidate = function (e) {
            if (e.candidate == null) {
                Log("Get the creator to call:", JSON.stringify(peerConn.localDescription));
            }
        };
        //var offer: RTCSessionDescriptionInit = { sdp: "test", type: "offer" };
        var offerDesc = new RTCSessionDescription(offer);
        peerConn.setRemoteDescription(offerDesc);
        peerConn.createAnswer({})
            .then(function (answerDesc) { return peerConn.setLocalDescription(answerDesc); })
            .catch(function (err) { return Warn("Couldn't create answer"); });
        document.getElementById("status").onkeypress = this.sendMessage;
    }
    return Client;
}());
var Host = /** @class */ (function () {
    function Host() {
        var _this = this;
        this.sendMessage = function (ev) {
            if (ev.keyCode == 13) {
                var t = ev.target;
                var msg = t.value.split("\n").pop();
                _this.dataChannel.send(msg);
            }
        };
        var peerConn = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });
        Log("Creating ...");
        this.dataChannel = peerConn.createDataChannel('test');
        this.dataChannel.onopen = function (e) {
            Log(_this.dataChannel.send("Connected"));
        };
        this.dataChannel.onmessage = function (e) { Log('Got message:', e.data); };
        peerConn.createOffer({})
            .then(function (desc) { return peerConn.setLocalDescription(desc); })
            .then(function () { })
            .catch(function (err) { return console.error(err); });
        peerConn.onicecandidate = function (e) {
            if (e.candidate == null) {
                Log("Get joiners to call: ", JSON.stringify(peerConn.localDescription));
                setTimeout(function () {
                    var value = JSON.parse(prompt("Joiner Response:") || "");
                    gotAnswer(value);
                }, 5000);
            }
        };
        var gotAnswer = function (answer) {
            Log("Initializing ...");
            peerConn.setRemoteDescription(new RTCSessionDescription(answer));
        };
        document.getElementById("status").onkeypress = this.sendMessage;
    }
    return Host;
}());
function StartHost(evt) {
    console.log("New Host");
    var host = new Host();
}
function StartClient(evt) {
    console.log("New Client");
    var client = new Client();
}
document.getElementById("host").onclick = StartHost;
document.getElementById("client").onclick = StartClient;
function Log() {
    var value = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        value[_i] = arguments[_i];
    }
    console.log(value);
    var status = document.getElementById("status");
    status.value += "LOG: " + value.join(" ") + "\n";
}
function Warn() {
    var value = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        value[_i] = arguments[_i];
    }
    console.warn(value);
    var status = document.getElementById("status");
    status.value += "WARN: " + value.join(" ") + "\n";
}
function Err() {
    var value = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        value[_i] = arguments[_i];
    }
    console.error(value);
    var status = document.getElementById("status");
    status.value += "ERROR: " + value.join(" ") + "\n";
}
//# sourceMappingURL=partyquiz.js.map