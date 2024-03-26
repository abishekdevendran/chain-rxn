import type * as Party from 'partykit/server';
import type { TChat, TParticipant, TStartGameMsg } from '$lib/types';

const colors = [
	"#FF0000",
	"#00FF00",
	"#0000FF",
	"#FFFF00",
	"#000000",
	"#FFFFFF",
	"#00FFFF",
	"#FF00FF",
	"#FFA500",
	"#800080",
	"#008080",
	"#32CD32"
]

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {
		// let's log the room id
		console.log(`Room created: ${room.id}`);
	}

	async onStart() {
		await this.room.storage.put("participants", []);
		await this.room.storage.put("chat", []);
		await this.room.storage.put("isGameInSession", false);
	}

	onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		// A websocket just connected!
		console.log(
			`Connected: ${conn.id}`
		);
	}

	async onClose(conn: Party.Connection) {
		// A websocket just disconnected!
		console.log(`Disconnected: ${conn.id}`);
		let participants = await this.room.storage.get<TParticipant[]>("participants");
		if (participants) {
			let user = participants.find(p => {
				console.log(p.connId, conn.id);
				return p.connId === conn.id;
			});
			console.log(user);
			if (user) {
				participants = participants.filter(p => p.connId !== conn.id);
				await this.room.storage.put("participants", participants);
				// tell everyone else that the user left
				this.room.broadcast(
					JSON.stringify({
						type: 'leave',
						id: user.id
					}),
					[conn.id]
				);
			}
		}
	}

	async onMessage(message: string, sender: Party.Connection) {
		let msg: {
			type: 'message',
			from: string,
			fromId: string,
			data: string
		} | {
			type: 'join',
			from: string,
			fromId: string
		} | {
			type: 'ready',
			fromId: string
			isReady: boolean
		} = JSON.parse(message);
		switch (msg.type) {
			case 'message': {
				let chat = await this.room.storage.get<TChat[]>("chat");
				chat?.push({
					data: msg.data,
					from: msg.from,
					fromId: msg.fromId
				});
				await this.room.storage.put("chat", chat);
				this.room.broadcast(
					`${message}`,
				);
				break;
			}
			case 'join': {
				// check if the user is already in the room
				let participants = await this.room.storage.get<TParticipant[]>("participants");
				if (participants) {
					let user = participants.find(p => p.id === msg.fromId);
					let tempColors = colors[0];
					// pick a color that's not already in use
					for (let i = 0; i < colors.length; i++) {
						if (!participants.find(p => p.color === colors[i])) {
							tempColors = colors[i];
							break;
						}
					}
					if (!user) {
						participants.push({
							connId: sender.id,
							id: msg.fromId,
							name: msg.from,
							color: tempColors,
							isReady: false
						});
						await this.room.storage.put("participants", participants);
						// tell everyone else that the user joined
						this.room.broadcast(
							JSON.stringify({
								type: 'join',
								id: msg.fromId,
								name: msg.from,
								color: tempColors
							}),
							[sender.id]
						);
					}
					// send the user the list of participants
					sender.send(
						JSON.stringify({
							type: 'statePopulate',
							participants,
							chat: await this.room.storage.get<{
								data: string,
								from: string,
								fromId: string,
							}[]>("chat") || [],
							isGameInSession: await this.room.storage.get<boolean>("isGameInSession")
						})
					)
				}
				break;
			}
			case 'ready': {
				let participants = await this.room.storage.get<{
					connId: string,
					id: string,
					name: string,
					color: string,
					isReady: boolean
				}[]>("participants");
				if (participants) {
					let user = participants.find(p => p.id === msg.fromId);
					if (user) {
						let tempMsg = msg;
						participants = participants.map(p => {
							if (p.id === msg.fromId) {
								p.isReady = tempMsg.isReady;
							}
							return p;
						});
						await this.room.storage.put("participants", participants);
						this.room.broadcast(
							JSON.stringify({
								type: 'ready',
								id: msg.fromId,
								isReady: msg.isReady
							}),
							[sender.id]
						);
						// if >1 player is ready, start the game
						let readyPlayers = participants.filter(p => p.isReady);
						if (readyPlayers.length > 1) {
							await this.room.storage.put("isGameInSession", true);
							this.room.broadcast(
								JSON.stringify({
									type: 'start',
									shouldStart: true
								} as TStartGameMsg)
							);
						}
					}
				}
				break;
			}
		}
	}
}

Server satisfies Party.Worker;
