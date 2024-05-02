import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";


export interface User{
    name: string,
    socket: Socket
}

export class UserManager{
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;
    constructor(){
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(user : User){
        this.users.push(user);
        this.queue.push(user.socket.id);
        user.socket.send("lobby");
        this.clearQueue();
        this.initHandler(user.socket);
    }
    removeUser(socketId : string){
        const user = this.users.find((x)=>{
            x.socket.id === socketId;
        })
        this.users = this.users.filter((x)=>{
            x.socket.id !== socketId;
        })
        this.queue = this.queue.filter((x)=>{
            x !== socketId;
        })
    }

    clearQueue(){
        if(this.queue.length<2) return;
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        const user1 = this.users.find((x)=>{
            return x.socket.id === id1;
        })
        const user2 = this.users.find((x)=>{
            return x.socket.id === id2;
        })

        if(!user1 || !user2) return;

        this.roomManager.createRoom(user1, user2);


    }

    initHandler(socket: Socket){
        socket.on("offer", ({sdp , roomId}: {sdp: string, roomId:string})=>{
            this.roomManager.onOffer(roomId, sdp, socket.id);
        })
        socket.on("answer", ({sdp , roomId}: {sdp: string, roomId:string})=>{
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        })
        socket.on("add-ice-candidate", ({candidate, roomId, type})=>{
            this.roomManager.onIceCandidate(roomId, socket.id, candidate, type);
        })
        
    }
}