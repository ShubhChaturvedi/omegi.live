import express from "express";
import { createServer } from "http";
import {
    Server, Socket
} from "socket.io";
import { UserManager } from "./Managers/UserManager";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors : {
    origin : "*"
  }
});

app.get("/", (req, res) => {
  res.send("health check");
});

const userManager = new UserManager();

io.on("connection", (socket: Socket)=>{
    console.log("a user is connected");
    userManager.addUser({name: "Shubh", socket});

    socket.on("disconnect", ()=>{
        console.log("a user is disconnected");
        userManager.removeUser(socket.id);
    })

})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});