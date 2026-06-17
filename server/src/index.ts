import { WebSocketServer, WebSocket } from 'ws';
import RoomManager from './RoomManager.js';
import { MessageType, WebSocketMessage, ClientMessage, ServerMessage } from './types.js';
import { passages } from './passages.js';

function send(ws: WebSocket, message: WebSocketMessage | ClientMessage | ServerMessage) {
    ws.send(JSON.stringify(message));
}

async function fetchPassage(retries: number = 3) {
    try {
        if (retries === 0) {
            throw new Error('max retries reached, falling back to local passages');
        }
        let response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const finResponse: any = await response.json();
        if (finResponse.extract.length < 100 || finResponse.extract.length > 500) {
            await fetchPassage(retries - 1);
        }
        else {
            return finResponse.extract;
        }
    } catch (err) {
        console.error(err);
        let randomIdx = Math.floor(Math.random() * passages.length);
        let passage = passages[randomIdx];
        return passage.text;
    }
}

const connection = new WebSocketServer({ port: 8080 });
console.log('server running on port 8080');
const roomManager = new RoomManager();

connection.on('connection', (ws: WebSocket) => {
    ws.on('message', async (data) => {
        const message = JSON.parse(data.toString());
        switch (message.type) {
            case 'create_room': {
                const room = roomManager.createRoom(ws, message.playerName);
                send(ws, { type: MessageType.ROOM_CREATED, roomCode: room.code })
                break;
            }
            case 'join_room': {
                const room = roomManager.getRoom(message.roomCode);
                if (!room) {
                    send(ws, { type: MessageType.ERROR, message: 'Room not found' });
                    return;
                }
                roomManager.joinRoom(room.code, ws, message.playerName);

                send(room.players[0].ws, { type: MessageType.OPPONENT_JOINED, opponentName: message.playerName })
                send(ws, { type: MessageType.OPPONENT_JOINED, opponentName: room.players[0].name })
                break;
            }
            case 'start_match': {
                const room = roomManager.getRoom(message.roomCode);
                if (!room) {
                    send(ws, { type: MessageType.ERROR, message: 'Room not found' });
                    return;
                }
                let passage = await fetchPassage() ?? passages[0].text;
                room.players.forEach(player => {
                    send(player.ws, { type: MessageType.MATCH_STARTED, passage });
                })
                break;
            }
            case 'match_finished': {
                const room = roomManager.getRoom(message.roomCode);
                if (!room) {
                    send(ws, { type: MessageType.ERROR, message: 'Room not found' });
                    return;
                }
                const opponent = room.players.find(p => p.ws !== ws);
                if (!opponent) return;

                send(opponent.ws, { type: MessageType.OPPONENT_FINISHED, opponentName: opponent.name });
                roomManager.removeRoom(message.roomCode);
                break;
            }
        }
    });

    ws.on('close', async (data) => {
        const room = roomManager.getRoomByPlayer(ws);
        if (!room) return;
        const opponent = room.players.find(p => p.ws !== ws);
        if (!opponent) return;
        send(opponent.ws, { type: MessageType.MATCH_FINISHED, roomCode: room.code});
        roomManager.removeRoom(room.code);
    })
});