<script lang="ts">
	import PartySocket from 'partysocket';
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import Lobby from '$lib/components/game/Lobby.svelte';
	import { beforeNavigate } from '$app/navigation';
	import type {
		TJoinMsg,
		TMessageMsg,
		TStatePopulate,
		TSysMsg,
		TLeaveMsg,
		TReadyMsg,
		TStartGameMsg
	} from '$lib/types.js';
	let dialogOpen = $state(true);
	let roomPlayers = $state<
		{
			id: string;
			name: string;
			color: string;
			isReady: boolean;
		}[]
	>([]);
	let msgs = $state<
		{
			sender: string;
			message: string;
		}[]
	>([]);
	let isGameInSession = $state(false);
	// connect to our server
	let partySocket: PartySocket | null = $state(null);
	$effect(() => {
		if (data.uname) {
			console.log('init party socket for uname: ', data.uname);
			partySocket = new PartySocket({
				host: 'localhost:8000',
				room: data.roomId
			});
		}
		return () => {
			console.log('effect cleanup 1');
			partySocket?.close();
		};
	});
	$effect(() => {
		// console.log('data changed', data);
		console.log('Effect');
		if (partySocket) {
			console.log('Socket exists.');
			// print each incoming message from the server to console
			partySocket.addEventListener('message', (e) => {
				let data:
					| TMessageMsg
					| TSysMsg
					| TJoinMsg
					| TStatePopulate
					| TLeaveMsg
					| TReadyMsg
					| TStartGameMsg = JSON.parse(e.data);
				console.log('Server: ', data);
				switch (data.type) {
					case 'message': {
						msgs.push({
							sender: data.from,
							message: data.data
						});
						break;
					}
					case 'system':
						console.log('System message: ', data.data);
						break;
					case 'join': {
						roomPlayers.push({
							id: data.id,
							name: data.name,
							color: data.color,
							isReady: false
						});
						toast('Player joined: ' + data.name);
						break;
					}
					case 'statePopulate': {
						roomPlayers = data.participants;
						msgs = data.chat.map((msg) => ({
							sender: msg.from,
							message: msg.data
						}));
						isGameInSession = data.isGameInSession;
						break;
					}
					case 'leave': {
						// console.log('Player left: ', data.id);
						let tempData = data;
						let leftPlayer = roomPlayers.find((player) => player.id === tempData.id);
						toast('Player left: ' + leftPlayer?.name);
						roomPlayers = roomPlayers.filter((player) => player.id !== tempData.id!);
						break;
					}
					case 'ready': {
						let tempData = data;
						let player = roomPlayers.find((player) => player.id === tempData.id);
						if (player) {
							player.isReady = data.isReady;
						}
						break;
					}
					case 'start': {
						console.log('Game started');
						toast.success('Game started!');
						break;
					}
				}
			});
			partySocket.send(
				JSON.stringify({
					type: 'join',
					fromId: data.uid,
					from: data.uname
				})
			);
		}
	});
	beforeNavigate(() => {
		if (partySocket && partySocket.readyState === WebSocket.OPEN) {
			console.log('Closing socket on Navigating away');
			partySocket?.close();
		}
	});
</script>

{#if data.uname}
	<Lobby {partySocket} {data} {msgs} {roomPlayers} {isGameInSession} />
{:else}
	<AlertDialog.Root bind:open={dialogOpen}>
		<AlertDialog.Content class="sm:max-w-[425px]">
			<AlertDialog.Header>
				<AlertDialog.Title>Let's get started!</AlertDialog.Title>
				<AlertDialog.Description>
					Give yourself a funky username! You can always change it later.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<form class="grid gap-4 py-4" use:enhance action="/?/name" method="post">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="username" class="text-right">Username</Label>
					<input
						id="username"
						name="uname"
						class="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Enter your username"
						required
						minlength={3}
						maxlength={20}
					/>
					{#if form && form.error}
						<p class="col-span-4 text-sm text-red-500">{form.error}</p>
					{/if}
				</div>
				<AlertDialog.Footer>
					<Button type="submit">Save changes</Button>
				</AlertDialog.Footer>
			</form>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
