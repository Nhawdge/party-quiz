var socket = io();

const STATES = {
    login: "login",
    game: "game",
    lobby: "lobby",
    quizmaker: "quizmaker",
}

function JoinViewModel(parent) {
    var self = this;
    self.parent = parent;

    self.availableRooms = ko.observableArray();

    self.playerName = ko.observable();
    self.roomName = ko.observable();
    self.passcode = ko.observable();

    self.create = function () {
        socket.emit('newQuiz', {
            roomName: self.roomName(),
            passcode: self.passcode(),
            playerName: self.playerName()
        });
        self.parent.isHost(true);
    }

    self.join = function () {
        socket.emit('joinQuiz', {
            roomName: self.roomName(),
            passcode: self.passcode(),
            playerName: self.playerName()
        });
    }

    socket.on("JoinSuccess", function (data) {
        self.parent.GameVM().question(data.question);
        self.parent.GameVM().answers(data.answers);
        self.parent.GameVM().roomName(data.roomName);
        self.parent.GameVM().hostName(data.hostName);
        self.parent.state(data.state);
        self.parent.myName(self.playerName());
    });

    socket.on("JoinFail", function (data) {
        console.warn(data);
    });
}

function GameViewModel(parent) {
    var self = this;
    self.parent = parent;
    self.roomName = ko.observable();
    self.hostName = ko.observable();
    self.players = ko.observableArray();

    self.question = ko.observable();
    self.questionType = ko.observable({ type: "checkbox" });
    self.questionId = ko.observable();
    self.answers = ko.observableArray();
    self.answerLocked = ko.observable(false);

    self.scoreBoard = ko.observable();

    self.selectedAnswer = ko.observable();

    self.templateName = ko.computed(function () {
        return self.questionType().type;
    });

    socket.on("playerJoined", function (data) {
        self.players(data.players)
    })

    self.startGame = function () {
        socket.emit("NextQuestion", {
            roomName: self.roomName(),
            state: STATES.game
        })
    }

    self.nextQuestion = function () {
        self.saveAnswer();
        socket.emit("NextQuestion", {
            roomName: self.roomName()
        })

    }

    self.saveAnswer = function () {
        socket.emit("SaveAnswer", {
            roomName: self.roomName(),
            questionId: self.questionId(),
            selectedAnswer: self.selectedAnswer()
        })
        self.answerLocked(true);
    }


    socket.on("UpdateQuestion", function (data) {
        self.question(data.question);
        self.questionType(data.questionType)
        self.questionId(data.questionId);
        self.questionType().type == "checkbox"
            ? self.selectedAnswer = ko.observableArray()
            : self.selectedAnswer = ko.observable();
        self.answers(data.answers.length == 1 ? ["0"] : data.answers);

        self.scoreBoard(data.scores);
        self.answerLocked(false);
        self.parent.state(data.state);
    })
}

function QuizMakerViewModel(parent) {
    var self = this;
    self.parent = parent;
}

function BaseViewModel() {
    var self = this;
    self.myName = ko.observable();
    self.isHost = ko.observable(false);

    self.state = ko.observable(STATES.login);
    self.JoinVM = ko.observable(new JoinViewModel(self));
    self.GameVM = ko.observable(new GameViewModel(self));
    self.QuizMakerVM = ko.observable(new QuizMakerViewModel(self));

    self.states = ko.observable({
        "login": { data: self.JoinVM, name: "login" },
        "game": { data: self.GameVM, name: "game" },
        "lobby": { data: self.GameVM, name: "lobby" },
        "quizmaker": { data: self.QuizMakerVM, name: "quizmaker" },
    })

    self.activeState = ko.computed(function () {
        return self.states()[self.state()]
    })

}

ko.applyBindings(new BaseViewModel())