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


enum QuestionType {
    MultipleChoice,
    SingleChoice,
    WriteIn
}

interface QuizQuestion {
    questionId: string,
    question: string,
    questionType: QuestionType
    answers: Array<Answer>
}

interface Answer {
    text: string,
    value: number
}

var question1 = {
    questionId: "q1",
    question: "John is ...",
    questionType: QuestionType.SingleChoice,
    answers: [{
        text: "Awesome",
        value: 10
    }, {
        text: "Cool",
        value: 8
    }]
};

function QuizServer(channel: any) {
    channel.onmessage = (e) => {
        var data = JSON.parse(e.data);
        if (data && data.ready) {
            channel.send(JSON.stringify(question1));
        }
        if (data && data.questionId) {
            Log(data);
        }
    }

}

function QuizPlayer(channel: any) {
    channel.onmessage = (e) => {
        var question = JSON.parse(e.data) as QuizQuestion;
        console.log("Question:", question);
        if (question.questionId) {
            var submit = RenderQuestion(question);
            submit.onclick = (e) => {
                channel.send(JSON.stringify({ questionId: "q1", answer: "true" }))
            }
        }
    }
    channel.send(JSON.stringify({ ready: true }))
}

function RenderQuestion(question: QuizQuestion) {
    var quiz = document.getElementById("quiz") as HTMLDivElement;
    var label = document.createElement("label");
    label.innerText = question.question;
    quiz.appendChild(label);

    for (let i of question.answers) {
        var qlabel = document.createElement("label")
        var input = document.createElement("input");
        switch (question.questionType) {
            case QuestionType.SingleChoice:
                input.type = "radio";
                break;
            case QuestionType.MultipleChoice:
                input.type = "checkbox";
                break;
            case QuestionType.WriteIn:
                input.type = "text";
                break;
        }
        input.innerText = i.text;
        input.value = i.value.toString();
        input.name = question.questionId;
        qlabel.innerText = i.text;
        qlabel.appendChild(input)
        quiz.appendChild(qlabel);
    }
    var submit = document.createElement("input");
    submit.type = "submit";
    quiz.appendChild(submit)
    return submit;
}

function SendAnswers(channel) {

}