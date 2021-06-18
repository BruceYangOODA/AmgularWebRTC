const express = require('express')
const app = express()
const http = require('http');
http.globalAgent.maxSockets = 100;
http.Agent.maxSockets = 100;
const server = http.Server(app);
const io = require('socket.io')(server)

const users = require('./users');

//var ss = require('socket.io-stream');

SERVER_PORT = 4444;

io.on("connection", (socket) => {    
    users.pushUser(socket.id); 
    io.to(socket.id).emit("socket id", socket.id);
    io.emit("user connected", users.getUserList());    


    socket.on("callUser", ({idToCall,signalData}) =>{
        console.log("idToCall call ",idToCall);
        io.to(idToCall).emit("callUser",{signal:signalData, from:socket.id});
        io.to(idToCall).emit("listen",true);
    });

    socket.on("answerCall", (data) => {
        console.log("answerCall to ",data.idCallFrom);
        io.to(data.idCallFrom).emit('callAccepted', data.signal);
    });
    /*
    socket.on("get user list", (socket_ID) => {
        io.to(socket_ID).emit("user list", socket_ID);
        //users.getUserList(socket_ID)
    });*/

    socket.on("join room", bundle =>{
        const existUser = users.checkUserValid(bundle.userName);
        let userName = bundle.userName;
        let room = bundle.room;
        if(existUser === undefined) {            
            socket.join(room);
            users.registUserRoom(socket.id, userName, room);
            io.to(socket.id).emit("user valid",true);
            io.emit("user join room", users.getUserList());

            let msg = {from:"system", to:"all", msg:userName+" 進入對話室 "+"["+room+"]",index:-1} ;
            io.to(room).emit("receive msg",msg);
        }
        else {
            io.to(socket.id).emit("user valid",false);
        }       
    });

    socket.on("send msg", bundle =>{
        let room = bundle.room;
        let msg = bundle.msg;
        io.to(room).emit("receive msg",msg);
    });

    socket.on("leave room", bundle =>{
        let user = users.leaveUserRoom(socket.id);
        let room = bundle.room
        let userName= bundle.userName
        if(user) {
            let msg = {from:"system", to:"all", msg:userName+" 離開對話室 "+"["+room+"]",index:-1} ;
            io.to(room).emit("receive msg",msg);

            socket.leave(bundle.room);
            io.emit("user leave room", users.getUserList());

        } else { console.log("NOT SUCH USER ON LEAVE ROOM"); }       
    });

    socket.on("destroy peer", (talkToID) =>{
        io.to(talkToID).emit("destroy peer");
    });

    socket.on("disconnect", () => {
        let user = users.removeUser(socket.id);
        if(user) io.emit("user disconnected", users.getUserList());
        else console.log("SOCKET DISCONNECT FAILED");        
    });
});


app.get('/', (req,res) => {
    console.log("CCCCCCCC");
    res.end("4444");
})

server.listen(SERVER_PORT, () => console.log("SERVER PORT",SERVER_PORT));



