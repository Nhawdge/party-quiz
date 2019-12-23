class Host {
    dataChannel: any;
    constructor() {
        var peerConn = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });
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

    sendMessage = (ev: KeyboardEvent) => {
        if (ev.keyCode == 13){
            
            var t = ev.target as HTMLTextAreaElement;
            var msg = t.value.split("\n").pop();
            this.dataChannel.send(msg);
        }
    }
}