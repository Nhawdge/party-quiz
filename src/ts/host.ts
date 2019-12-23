class Host extends BaseRtc {
    dataChannel: any;
    constructor() {
        super();
        var peerConn = this.peerConn;
        Log("Creating ...");
        this.dataChannel = peerConn.createDataChannel('test');
        this.dataChannel.onopen = (e) => {
             this.toggleStatusWindow();
            QuizServer(this.dataChannel);
        };

        this.dataChannel.onmessage = (e) => { Log('Got message:', e.data); };
        peerConn.createOffer({})
            .then((desc) => peerConn.setLocalDescription(desc))
            .then(() => { })
            .catch((err) => console.error(err));

        peerConn.onicecandidate = (e) => {
            if (e.candidate == null) {
                Log("Get joiners to call: ", JSON.stringify(peerConn.localDescription));
            }
        };

        var acceptButton = (document.getElementById("acceptClient") as HTMLButtonElement)
        acceptButton.onclick = () =>
            gotAnswer(JSON.parse(prompt("Joiner code") || ""));

        acceptButton.hidden = false;

        var gotAnswer = (answer) => {
            Log("Initializing ...");
            peerConn.setRemoteDescription(new RTCSessionDescription(answer));
        };

    }
}