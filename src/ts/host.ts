class Host extends BaseRtc {
    dataChannel: any;
    constructor() {
        super();
        var peerConn =this.peerConn;
        Log("Creating ...");
        this.dataChannel = peerConn.createDataChannel('test');
        this.dataChannel.onopen = (e) => {
            Log(this.dataChannel.send("Connected"))
        };

        this.dataChannel.onmessage = (e) => { Log('Got message:', e.data); };
        peerConn.createOffer({})
            .then((desc) => peerConn.setLocalDescription(desc))
            .then(() => { })
            .catch((err) => console.error(err));

        peerConn.onicecandidate = (e) => {
            if (e.candidate == null) {
                Log("Get joiners to call: ", JSON.stringify(peerConn.localDescription));
                setTimeout(() => {
                    var value = JSON.parse(prompt("Joiner Response:") || "");
                    gotAnswer(value);
                }, 5000);
            }
        };

        var gotAnswer = (answer) => {
            Log("Initializing ...");
            peerConn.setRemoteDescription(new RTCSessionDescription(answer));
        };

        (document.getElementById("status") as HTMLTextAreaElement).onkeypress = this.sendMessage
    }
}