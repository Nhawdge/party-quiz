var socket = io();

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

    self.templateName = ko.computed(function () {
        return self.questionType().type;
    });

    socket.on("playerJoined", function (data) {
        self.players(data.players)
    })

    self.startGame = function () {
        socket.emit("NextQuestion", {
            roomName: self.roomName(),
            state: 2
        })
    }
    self.nextQuestion = function () {
        socket.emit("NextQuestion", {
            roomName: self.roomName()
        })
    }

    self.saveAnswer = function () {

    }

    socket.on("UpdateQuestion", function (data) {
        self.question(data.question);
        self.questionType(data.questionType)
        self.answers(data.answers.length == 1 ? ["0"] : data.answers);
        console.log(data.answers);
        self.parent.state(data.state);
    })
}

function BaseViewModel() {
    var self = this;
    self.myName = ko.observable();
    self.isHost = ko.observable(false);

    self.state = ko.observable(1);
    self.JoinVM = ko.observable(new JoinViewModel(self));
    self.GameVM = ko.observable(new GameViewModel(self));
}

ko.applyBindings(new BaseViewModel())