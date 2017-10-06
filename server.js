// Load the express module (Where do you think this comes from?)
var express = require("express");
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require("path");

// invoke var express and store the resulting application in var app
var app = express();

// use it!
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'codingdojorocks'}));  // string for encryption
app.use(express.static(__dirname + '/public')); //css
app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res){
    res.render('index.ejs', {count: req.session.count});
});

var server = app.listen(8000, function() {
    console.log("listening on port 8000");
});
var io = require('socket.io').listen(server);

var users = {}

io.sockets.on('connection', function (socket) {
    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);
    // all the server socket code goes in here
    // If you don't know where this code is supposed to go reread the above info 
    socket.on("got_a_new_user", function (data){
        users[socket.id] = data.name;
        socket.broadcast.emit("new_user",{user: data.name});
        socket.emit("user_connected",{});
    });

    socket.on('disconnect', function(){
        console.log("Client/socket is disconnected!");
        console.log("Client/socket id is: ", socket.id);
        socket.broadcast.emit("user_disconnected",{user:users[socket.id]});
        delete users[socket.id];
    });
    
    socket.on('message_clicked', function(data){
        socket.broadcast.emit("new_message",{user:users[socket.id],message:data.message});
        socket.emit("new_message",{user:users[socket.id],message:data.message});
    });
})