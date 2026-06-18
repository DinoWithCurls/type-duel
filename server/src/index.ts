/** WebSocket server entry point — handles all client messages and room lifecycle. */
import { WebSocketServer, WebSocket } from 'ws';
import RoomManager from './RoomManager.js';
import { MessageType, WebSocketMessage, ClientMessage, ServerMessage } from '../../shared/types.js';
import { passages } from './passages.js';


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const connection = new WebSocketServer({port: PORT});
console.log(`server running on port ${PORT}`);

function send(ws: WebSocket, message: WebSocketMessage | ClientMessage | ServerMessage) {
    ws.send(JSON.stringify(message));
}

const isTypeable = (text: string) => /^[\x20-\x7E]+$/.test(text);

async function fetchPassage(retries: number = 6) {
    try {
        if (retries === 0) {
            throw new Error('max retries reached, falling back to local passages');
        }
        let response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const finResponse: any = await response.json();
        if (finResponse.extract.length < 100 || finResponse.extract.length > 500 || !isTypeable(finResponse)) {
            await fetchPassage(retries - 1);
        }
        else {
            return finResponse.extract;
        }
    } catch (err) {
        console.error(err);
        return passages[Math.floor(Math.random() * passages.length)].text;
    }
}

const roomManager = new RoomManager();

connection.on('connection', (ws: WebSocket) => {
    ws.on('message', async (data) => {
        const message = JSON.parse(data.toString());
        switch (message.type) {
            // Creates a room for the player; if singlePlayer, skips waiting and immediately sends passage.
            case 'create_room': {
                const room = roomManager.createRoom(ws, message.playerName);
                send(ws, { type: MessageType.ROOM_CREATED, roomCode: room.code })
                if(message.singlePlayer) {
                    const passage = await fetchPassage() ?? passages[0].text;
                    send(ws, { type: MessageType.MATCH_STARTED, passage });
                }
                break;
            }
            // Adds second player to room; sends opponent_joined to both players.
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
            // Fetches a passage and sends match_started to all players in the room.
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
            // Forwards finished player's final stats to the opponent as opponent_finished.
            case 'match_finished': {
                const room = roomManager.getRoom(message.roomCode);
                if (!room) return;
                const opponent = room.players.find(p => p.ws !== ws);
                if (!opponent) return;
                send(opponent.ws, { type: MessageType.OPPONENT_FINISHED, opponentName: opponent.name, finalWpm: message.finalWpm, cursorIndex: message.cursorIndex, errors: message.errors, totalKeystrokes: message.totalKeystrokes });
                room.status = 'ready';
                break;
            }
            // Tracks rematch consent; once both players agree, fetches new passage and sends rematch_start.
            case 'rematch': {
                const room = roomManager.getRoom(message.roomCode);
                if (!room) return;
                room.rematchCount++;
                if (room.rematchCount === 2) {
                    room.rematchCount = 0;
                    room.status = 'ready';
                    const passage = await fetchPassage() ?? passages[0].text;
                    room.players.forEach(player => {
                        send(player.ws, { type: MessageType.REMATCH_START, passage });
                    });
                }
                break;
            }
        }
    });

    ws.on('close', async () => {
        const room = roomManager.getRoomByPlayer(ws);
        if (!room) return;
        const opponent = room.players.find(p => p.ws !== ws);
        if (!opponent) return;
        send(opponent.ws, { type: MessageType.MATCH_FINISHED, roomCode: room.code });
        roomManager.removeRoom(room.code);
    })
});