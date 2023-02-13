const express = require('express');
require("dotenv").config();
const bodyParser = require('body-parser');
const cors = require('cors');
const messageRouter = require('./Router/Message');
const converRouter = require('./Router/Conversation');
const userRouter = require('./Router/User');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const {connectMongoDb} = require('./db');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http,{
    cors:{
        origin:"http://localhost:3000",
    }
});


////////////////////// MiddleWare

const corsOptions = {
    origin: true, //included origin as true
    credentials: true, //included credentials as true
  };

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended:true}));

//////////////Router
app.use('/message', messageRouter);
app.use('/conver', converRouter);
app.use('/user', userRouter);

//////////////////////// Socket Io

let users = [];

// add user in socket
const addUser = (userId,socketId)=>{
    !users.some((user)=>user.userId === userId) && users.push({userId,socketId})
}
// remove user in socket
const removeUser = (socketId)=>{
    users = users.filter((data)=> data.socketId !== socketId)
} 
// get user Id in socket
const getUser = (userId)=>{
    return users.find((user)=> user.userId === userId)
}
// socket io connection
io.on("connection",(socket)=>{
    //connection status
    console.log(`a user connected.${socket.id}`)

    //take UserId and socketId from User
    socket.on("addUser",(userId)=>{
        addUser(userId,socket.id);
        io.emit("getUser",users)
        })

        //send and get message
        socket.on("sendMessage",({senderId,receiverId,text})=>{
            let user = getUser(receiverId);
           if(user === undefined){
            console.log("user exists")
           }
           else{
            io.to(user.socketId).emit("getMessage",{
                senderId,
                text
            })
           } 
        })
          //newConver and get newConver
          socket.on("newConversation",({_id})=>{
            let user = getUser(_id);
           if(user === undefined){
            console.log("user exists")
           }
           else{
            io.to(user.socketId).emit("getConver",{
                _id
            })
           } 
        })
            //deleteConver and updateConver
            socket.on("deleteCon",({id})=>{
                let user = getUser(id);
               if(user === undefined){
                console.log("user exists")
               }
               else{
                io.to(user.socketId).emit("updateConver",{
                    id
                })
               } 
            })
//when disconnected
        socket.on("disconnect",()=>{
            console.log(`A user disconnected`)
            removeUser(socket.id)
            io.emit("getUser",users)
        })
})

///////////////// NodeJs Connection
const Port = process.env.Port || 3001

connectMongoDb((err)=>{
    if(!err){
        http.listen(Port, ()=>{
            console.log("App is listening to http://localhost:3001/")
        })
    }
})



