class Client {
    dataChannel: any;
    constructor() {
        Log("Joining ...");
        var offer = JSON.parse(prompt("Paste connection string") || "");
        var peerConn = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });

        peerConn.ondatachannel = (e) => {
            this.dataChannel = e.channel;
            this.dataChannel.onopen = (e) => {
                this.dataChannel.send("Connected")
            };
            this.dataChannel.onmessage = (e) => { Log('Got message:', e.data); }
        };

        peerConn.onicecandidate = (e) => {
            if (e.candidate == null) {
                Log("Get the creator to call:", JSON.stringify(peerConn.localDescription))
            }
        };
        //var offer: RTCSessionDescriptionInit = { sdp: "test", type: "offer" };
        var offerDesc = new RTCSessionDescription(offer);
        peerConn.setRemoteDescription(offerDesc);
        peerConn.createAnswer({})
            .then((answerDesc) => peerConn.setLocalDescription(answerDesc))
            .catch((err) => Warn("Couldn't create answer"));

        (document.getElementById("status") as HTMLTextAreaElement).onkeypress = this.sendMessage

    }

    sendMessage = (ev: KeyboardEvent) => {
        console.log(ev)
        if (ev.keyCode  == 13) {
            var t = ev.target as HTMLTextAreaElement;
            var msg = t.value.split("\n").pop();
            this.dataChannel.send(msg);
        }
    }
}
