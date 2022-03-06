const express = require('express');
// const session = require('express-session');
const socket = require('socket.io')
const path = require('path');
const bodyParser = require('body-parser');

const server = express();
const http = require('http').Server(server);
const io = socket(http);

server.set("view engine", "ejs");
server.set("views",
    [path.join(__dirname, "./views")])

// server.use(session({
//     secret: "private key",
//     cookie: { maxAge: 300000 },
//     saveUninitialized: false
// }));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

var activeSessions = [];

io.on('connection', (connetion) => {
    connetion.on('connect', () => {
        console.log("Connection made to ID " + connetion.id);
    })

    connetion.on('disconnect', ()=>{
        console.log("Disconnected from ID " + connetion.id);
        const updatedUsers = activeSessions.filter(activeSessions => activeSessions != connetion.nickname);
        activeSessions = updatedUsers;
        io.emit('activeUsers', activeSessions);
    })

    // nick event
    connetion.on('nick', (nickname) => {
        // console.log("nick => nickname : ", nickname)
        socket.nickname = nickname
        activeSessions.push(nickname)
        console.log("server activeSessions : ", activeSessions)
        io.emit('activeUsers', activeSessions);
    });

    // chat event
    connetion.on('chat', (data) => {
        console.log("chat => nickname : ", socket.nickname)
        io.emit('chat', `${socket.nickname} : ${data.message}`)
    });
})

server.get("/", (req, res)=>{
    res.render('chat');
});

http.listen(3000, ()=>{
    console.log("Server is listening on 3300");
})