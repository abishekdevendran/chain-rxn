export type TParticipant = {
    connId: string,
    id: string,
    name: string,
    color: string,
    isReady: boolean
}

export type TChat = {
    data: string,
    from: string,
    fromId: string,
}

export type TMessageMsg = {
    type: 'message';
    from: string;
    fromId: string;
    data: string;
}

export type TSysMsg = {
    type: 'system';
    data: string;
}

export type TJoinMsg = {
    type: 'join';
    id: string;
    name: string;
    color: string;
}

export type TStatePopulate = {
    type: 'statePopulate';
    participants: {
        id: string;
        name: string;
        color: string;
        isReady: boolean;
    }[];
    chat: {
        data: string;
        from: string;
        fromId: string;
    }[];
    isGameInSession: boolean;
}

export type TLeaveMsg = {
    type: 'leave';
    id: string;
}

export type TReadyMsg = {
    type: 'ready';
    id: string;
    isReady: boolean;
}

export type TStartGameMsg = {
    type: 'start';
    shouldStart: boolean;
  }