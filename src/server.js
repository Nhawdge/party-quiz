// Express
let express = require('express')

// Create app
let app = express()

//Set up server
let server = app.listen(process.env.PORT || 2000, listen);

function listen() {
    let host = server.address().address;
    let port = server.address().port;
    console.log('Quiz Server started');
}

// Force SSL
// app.use((req, res, next) => {
//     if (req.header('x-forwarded-proto') !== 'https') {
//         res.redirect(`https://${req.header('host')}${req.url}`)
//     } else {
//         next();
//     }
// });

const STATES = {
    login: "login",
    game: "game",
    lobby: "lobby",
    quizmaker: "quizmaker",
}


var quizzes = require("./server/quiz.json");
app.use(express.static('src/web'))
let io = require('socket.io')(server)

// Catch wildcard socket events
var middleware = require('socketio-wildcard')()
io.use(middleware)

const CONNECTIONS = {};
const QUIZROOMS = {};

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

    socket.on("SaveAnswer", (data) => {
        console.log("sa socket", data)
        var quiz = QUIZROOMS[data.roomName];
        if (data.state) {
            quiz.state = data.state;
        }
        quiz.saveAnswer(data, socket.id);
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
class Player {

    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.score = 0;
    }
}

class Quiz {
    constructor() {
        this.roomName = "";
        this.host = "";
        this.selectedQuiz = quizzes.quizzes[1];
        this.players = []
        this.questionIndex = 0;
        this.state = STATES.lobby;
        this.answers = {};
    }

    updatePlayers() {
        for (let player of this.players) {
            CONNECTIONS[player.id].emit("JoinSuccess", {
                roomName: this.roomName,
                hostName: this.host,
                state: this.state
            });
            CONNECTIONS[player.id].emit("playerJoined", {
                players: this.players.map(x => x.name)
            });
        }
    }

    saveAnswer(data) {
        var splitId = data.questionId.split("|");
        var playerId = splitId[0];
        var questionIndex = splitId[1];
        console.log(data.questionId, playerId, questionIndex);

        var question = this.selectedQuiz.questions[questionIndex];
        var answers = question.answers;
        var userAnswer = answers.find(x => x.answer == data.selectedAnswer);

        if (userAnswer && !this.answers[playerId][data.questionId]) {
            this.players.find(x => x.id == playerId).score += userAnswer.points;
            this.answers[playerId][data.questionId] = data.selectedAnswer;
        }
        console.log("points: ", userAnswer, this.players);
    }

    nextQuestion() {
        if (this.questionIndex < this.selectedQuiz.questions.length) {
            for (let player of this.players) {
                CONNECTIONS[player.id].emit("UpdateQuestion", {
                    question: this.selectedQuiz.questions[this.questionIndex].question,
                    answers: this.selectedQuiz.questions[this.questionIndex].answers.map(x => x.answer),
                    questionType: this.questionType(),
                    state: this.state,
                    questionId: player.id + "|" + this.questionIndex,
                    scores: this.players.map(x => {
                        return {
                            name: x.name,
                            score: x.score
                        }
                    })
                })
            }
            this.questionIndex++;
            console.log(this.answers)
        } else {
            for (let player of this.players) {
                CONNECTIONS[player.id].emit("GameDone", {})
            }
        }
    }
    addPlayer(data, socketid) {
        this.players.push(new Player(socketid, data.playerName))
        this.answers[socketid] = {};
    }

    questionType() {
        var answers = this.selectedQuiz.questions[this.questionIndex].answers;
        if (answers.length == 1) {
            return {
                type: "range",
                min: answers[0].minRange,
                max: answers[0].maxRange
            };
        }
        switch (answers.filter(x => x.points).length) {
            case 0:
                return {
                    type: "text"
                };
            case 1:
                return {
                    type: "radio"
                };
            default:
                return {
                    type: "checkbox"
                };
        }
    }
}