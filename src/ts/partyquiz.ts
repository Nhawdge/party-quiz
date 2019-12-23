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


interface QuizQuestion {
    question: string,
    answers: Array<Answer>
}

interface Answer {
    text: string,
    value: number
}

var question1 = {
    question: "John is ...",
    answers: [{
        text: "Awesome",
        value: 10
    }, {
        text: "Cool",
        value: 8
    }]
};

function StartQuiz(channel: any) {
    channel.send(JSON.stringify(question1));
}