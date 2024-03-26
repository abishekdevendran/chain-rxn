import type PartySocket from "partysocket";

export const createRoomStore = () => {
    let isGameInSession = $state(false);
    let msgs = $state<
		{
			sender: string;
			message: string;
		}[]
	>([]);
    let roomPlayers = $state<
		{
			id: string;
			name: string;
			color: string;
			isReady: boolean;
		}[]
	>([]);
    let partySocket: PartySocket | null = null;

    return {
        get isGameInSession() {
            return isGameInSession;
        },
        get msgs() {
            return msgs;
        },
        get roomPlayers() {
            return roomPlayers;
        },
        get partySocket() {
            return partySocket;
        },
        set isGameInSession(value: boolean) {
            isGameInSession = value;
        },
        set msgs(value: {
            sender: string;
            message: string;
        }[]) {
            msgs = value;
        },
        set roomPlayers(value: {
            id: string;
            name: string;
            color: string;
            isReady: boolean;
        }[]) {
            roomPlayers = value;
        },
        set partySocket(value: PartySocket | null) {
            partySocket = value;
        }
    }
}

export const roomStore = createRoomStore();