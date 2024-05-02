"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.room = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.room.set(roomId.toString(), {
            user1,
            user2
        });
        user1.socket.emit("send-offer", {
            roomId
        });
        user2.socket.emit("send-offer", {
            roomId
        });
    }
    onAnswer(roomId, sdp, senderSocketId) {
        const room = this.room.get(roomId);
        if (!room)
            return;
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    onOffer(roomId, sdp, senderSocketId) {
        const room = this.room.get(roomId);
        if (!room)
            return;
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    onIceCandidate(roomId, senderSocketId, candidate, type) {
        const room = this.room.get(roomId);
        if (!room)
            return;
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser.socket.emit('add-ice-candidate', ({ candidate, type }));
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
