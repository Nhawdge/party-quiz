
function StartHost(evt: MouseEvent): void {
    console.log("New Host")
    var host = new Host();
}

function StartClient(evt: MouseEvent): void {
    console.log("New Client")
    var client = new Client();
}
(document.getElementById("host") as HTMLButtonElement).onclick = StartHost;
(document.getElementById("client") as HTMLButtonElement).onclick = StartClient;



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