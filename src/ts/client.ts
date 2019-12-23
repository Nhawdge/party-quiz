class Client extends BaseRtc {
    dataChannel: any;
    constructor() {
        super();
        Log("Joining ...");
        var offer = JSON.parse(prompt("Paste connection string") || "");
        var peerConn = this.peerConn;

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

        var offerDesc = new RTCSessionDescription(offer);
        peerConn.setRemoteDescription(offerDesc);
        peerConn.createAnswer({})
            .then((answerDesc) => peerConn.setLocalDescription(answerDesc))
            .catch((err) => Warn("Couldn't create answer"));
    }
}
