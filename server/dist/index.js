"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const UserManager_1 = require("./Managers/UserManager");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
app.get("/", (req, res) => {
    res.send("health check");
});
const userManager = new UserManager_1.UserManager();
io.on("connection", (socket) => {
    console.log("a user is connected");
    userManager.addUser({ name: "Shubh", socket });
    socket.on("disconnect", () => {
        console.log("a user is disconnected");
        userManager.removeUser(socket.id);
    });
});
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
