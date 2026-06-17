import {WebSocket} from "ws";

export type Room = {
    code: string,
    status: 'waiting' | 'ready' | 'in-progress',
    players: {
        ws: WebSocket,
        name: string
    }[];
    rematchCount: number;

}

/** Manages WebSocket rooms — each room holds two player connections and match state. */
class RoomManager {
    private _rooms: Map<string, Room> = new Map();

    /** Generates a random 6-char room code and initialises room with creator's connection. */
    createRoom(ws: WebSocket, playerName: string): Room {
        let code = Math.random().toString(36).substring(2, 8).toUpperCase();
        let room: Room = {
            status: 'waiting',
            code: code,
            players: [{ws, name: playerName}],
            rematchCount: 0
        }
        this._rooms.set(code, room);
        return room;
    }
    /** Adds second player to an existing room and sets status to ready. */
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

    /** Used for disconnect cleanup — finds which room a closing socket belongs to. */
    getRoomByPlayer(ws: WebSocket): Room | undefined {
        return Array.from(this._rooms.values()).find(
            room => room.players.some(p => p.ws === ws)
        );
    }
}

export default RoomManager;