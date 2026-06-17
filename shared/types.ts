enum MessageType {
    CREATE_ROOM='create_room',
    JOIN_ROOM='join_room',
    PLAYER_UPDATE='player_update',
    MATCH_FINISHED='match_finished',
    ROOM_CREATED='room_created',
    OPPONENT_JOINED='opponent_joined',
    MATCH_STARTED='match_started',
    START_MATCH='start_match',
    OPPONENT_UPDATE='opponent_update',
    OPPONENT_FINISHED='opponent_finished',
    REMATCH='rematch',
    REMATCH_START='rematch_start',
    ERROR='error'

}

type PlayerUpdateType = {
    type: MessageType,
    cursorIndex: number,
    errors: number,
    currentWpm: number,
    totalKeystrokes: number
}

interface CreateRoomMessage {
    type: MessageType.CREATE_ROOM,
    playerName: string
};

interface JoinRoomMessage {
    type: MessageType.JOIN_ROOM,
    roomCode: string,
    playerName: string;
}

interface PlayerUpdateMessage extends PlayerUpdateType {
    type: MessageType.PLAYER_UPDATE,
}

interface MatchFinishedMessage {
    type: MessageType.MATCH_FINISHED,
    roomCode: string;
}

interface RoomCreatedMessage {
    type: MessageType.ROOM_CREATED
    roomCode: string
}

interface OpponentJoinedMessage {
    type: MessageType.OPPONENT_JOINED,
    opponentName: string
}

interface MatchStartedMessage {
    type: MessageType.MATCH_STARTED,
    passage: string
}

interface StartMatchMessage {
    type: MessageType.START_MATCH
}

interface OpponentUpdateMessage extends PlayerUpdateType {
    type: MessageType.OPPONENT_UPDATE,
}

interface OpponentFinishedMessage {
    type: MessageType.OPPONENT_FINISHED,
    opponentName: string,
    finalWpm: number;
    cursorIndex: number;
    errors: number;
    totalKeystrokes: number;
}

interface ErrorMessage {
    type: MessageType.ERROR,
    message: string
}

interface RematchMessage {
    type: MessageType.REMATCH,
    roomCode: string
}

interface RematchStartMessage {
    type: MessageType.REMATCH_START;
    passage: string
}

interface CreateRoomMessage {
    type: MessageType.CREATE_ROOM;
    playerName: string;
    singlePlayer: boolean;
}

export type WebSocketMessage = ErrorMessage;

export type ClientMessage = CreateRoomMessage | JoinRoomMessage | PlayerUpdateMessage | MatchFinishedMessage | StartMatchMessage | RematchMessage;

export type ServerMessage = RoomCreatedMessage | OpponentJoinedMessage | MatchStartedMessage | OpponentUpdateMessage | OpponentFinishedMessage | RematchStartMessage;

export { MessageType };