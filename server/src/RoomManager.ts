import {WebSocket} from "ws";

export type Room = {
    code: string,
    status: 'waiting' | 'ready' | 'in-progress',
    players: {
        ws: WebSocket,
        name: string
    }[];

}

class RoomManager {
    private _rooms: Map<string, Room> = new Map();

    createRoom(ws: WebSocket, playerName: string): Room {
        let code = Math.random().toString(36).substring(2, 8).toUpperCase();
        let room: Room = {
            status: 'waiting',
            code: code,
            players: [{ws, name: playerName}]
        }
        this._rooms.set(code, room);
        return room;
    }
    joinRoom(roomCode: string, ws: WebSocket, playerName: string) {
        
        let activeRoom = this._rooms.get(roomCode);
        if(!activeRoom) return;
        activeRoom.players.push({ws, name: playerName});
        activeRoom.status = 'ready';
    }
    getRoom(roomCode: string) {
        return this._rooms.get(roomCode);
    }
    removeRoom(roomCode: string) {
        return this._rooms.delete(roomCode);
    }

    getRoomByPlayer(ws: WebSocket): Room | undefined {
        return Array.from(this._rooms.values()).find(
            room => room.players.some(p => p.ws === ws)
        );
    }
}

export default RoomManager;