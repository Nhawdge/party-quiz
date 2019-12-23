abstract class BaseRtc {
    abstract dataChannel: any;
    peerConn: any;
    statusWindow: any;

    constructor() {
        this.peerConn = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });
        this.statusWindow = (document.getElementById("status") as HTMLTextAreaElement);
        this.statusWindow.onkeypress = this.sendMessage;
    }
    sendMessage = (ev: KeyboardEvent) => {
        if (ev.keyCode == 13) {
            var t = ev.target as HTMLTextAreaElement;
            var msg = t.value.split("\n").pop();
            this.dataChannel.send(msg);
        }
    }
    sendRaw = (msg: string) => {
        this.dataChannel.send(msg);
    }

    toggleStatusWindow = () => {
        this.statusWindow.hidden = !this.statusWindow.hidden;
    }
}

function Log(...value: any[]) {
    console.log(value);
    var status = (document.getElementById("status") as HTMLTextAreaElement);
    status.value += `LOG: ${value.join(" ")}\n`;
}
function Warn(...value: any[]) {
    console.warn(value);
    var status = (document.getElementById("status") as HTMLTextAreaElement);
    status.value += `WARN: ${value.join(" ")}\n`;
}
function Err(...value: any[]) {
    console.error(value);
    var status = (document.getElementById("status") as HTMLTextAreaElement);
    status.value += `ERROR: ${value.join(" ")}\n`;
}