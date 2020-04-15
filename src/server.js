// Express
let express = require('express')

// Create app
let app = express()

//Set up server
let server = app.listen(process.env.PORT || 2000, listen);

function listen() {
    let host = server.address().address;
    let port = server.address().port;
    console.log('Codenames Server Started at http://' + host + ':' + port);
}

// Force SSL
// app.use((req, res, next) => {
//     if (req.header('x-forwarded-proto') !== 'https') {
//         res.redirect(`https://${req.header('host')}${req.url}`)
//     } else {
//         next();
//     }
// });

var quizzes = require("./server/quiz.json");
app.use(express.static('src/web'))
let io = require('socket.io')(server)

// Catch wildcard socket events
var middleware = require('socketio-wildcard')()
io.use(middleware)

var CONNECTIONS = {};
var QUIZROOMS = {};

io.sockets.on('connection', function (socket) {
    CONNECTIONS[socket.id] = socket;

    socket.on('newQuiz', (data) => {
        newQuiz(socket, data);
    })

    socket.on('joinQuiz', (data) => {
        joinQuiz(socket, data)
    })
    socket.on("NextQuestion", (data) => {
        var quiz = QUIZROOMS[data.roomName];
        if (data.state) {
            quiz.state = data.state;
        }
        quiz.nextQuestion();
    })
})

function newQuiz(socket, data) {
    var quiz = new Quiz();
    quiz.roomName = data.roomName;
    quiz.host = data.playerName;

    quiz.addPlayer(data, socket.id);
    quiz.updatePlayers();
    QUIZROOMS[data.roomName] = quiz;
}


function joinQuiz(socket, data) {
    var quiz = QUIZROOMS[data.roomName]
    if (!quiz) {
        socket.emit("JoinFail", {
            status: "error",
            message: "room name does not exist"
        })

    } else { 
        quiz.addPlayer(data, socket.id);
        quiz.updatePlayers();
    }
}

function Quiz() {
    var self = this;
    self.roomName = "";
    self.host = "";
    self.selectedQuiz = quizzes.quizzes[0];
    self.players = []
    self.questionIndex = 0;
    self.state = 0;

    self.updatePlayers = function () {
        for (let player of self.players) {
            CONNECTIONS[player.id].emit("JoinSuccess", {
                roomName: self.roomName,
                hostName: self.host,
                state: self.state
            });
            CONNECTIONS[player.id].emit("playerJoined", {
                players: self.players.map(x => x.name)
            });
        }
    }
    self.nextQuestion = function () {
        if (self.questionIndex < self.selectedQuiz.questions.length) {
            for (let player of self.players) {
                CONNECTIONS[player.id].emit("UpdateQuestion", {
                    question: self.selectedQuiz.questions[self.questionIndex].question,
                    answers: self.selectedQuiz.questions[self.questionIndex].answers.map(x => x.answer),
                    questionType: self.questionType(),
                    state: self.state,
                    questionId: player.id + "-" + self.questionIndex
                })
            }
            self.questionIndex++;
        } else {
            for (let player of self.players) {
                CONNECTIONS[player.id].emit("GameDone", {})
            }
        }
    }
    self.addPlayer = function (data, socketid) {
        self.players.push({
            id: socketid,
            name: data.playerName
        });
    }

    self.questionType = function () {
        var answers = self.selectedQuiz.questions[self.questionIndex].answers;
        switch (answers.filter(x => x.points).length) {
            case 0:
                return "text";
            case 1:
                return "radio";
            default:
                return "checkbox";
        }
    }
}