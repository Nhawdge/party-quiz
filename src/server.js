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


app.use(express.static('src/web'))


let io = require('socket.io')(server)

// Catch wildcard socket events
var middleware = require('socketio-wildcard')()
io.use(middleware)

var connections = {};


io.sockets.on('connection', function (socket) {
    connections[socket.id] = socket;

    socket.on('newQuiz', (data) => {
        newQuiz(socket, data)
    })
    socket.on('joinQuiz', (data) => {
        joinQuiz(socket, data)
    })
})

function newQuiz(socket, data) {
    console.log(connections)
    for (let player in connections) {
        connections[player].emit("NewRoom", {
            roomName: data.roomName
        });
    }
}

function joinQuiz(socket, data) {
    console.log(data);
}