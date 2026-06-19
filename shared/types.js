"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType["CREATE_ROOM"] = "create_room";
    MessageType["JOIN_ROOM"] = "join_room";
    MessageType["MATCH_FINISHED"] = "match_finished";
    MessageType["ROOM_CREATED"] = "room_created";
    MessageType["OPPONENT_JOINED"] = "opponent_joined";
    MessageType["MATCH_STARTED"] = "match_started";
    MessageType["START_MATCH"] = "start_match";
    MessageType["OPPONENT_FINISHED"] = "opponent_finished";
    MessageType["REMATCH"] = "rematch";
    MessageType["REMATCH_START"] = "rematch_start";
    MessageType["ERROR"] = "error";
})(MessageType || (exports.MessageType = MessageType = {}));
;
//# sourceMappingURL=types.js.map