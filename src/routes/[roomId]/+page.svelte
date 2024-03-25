<script lang="ts">
	import PartySocket from 'partysocket';
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
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
	let partyMsg = $derived((msg: string, type: 'message' = 'message') =>
		partySocket?.send(
			JSON.stringify({
				type: type,
				from: data.uname,
				fromId: data.uid,
				data: msg
			})
		)
	);
	$effect(() => {
		if (data.uname) {
			console.log('init party socket');
			partySocket = new PartySocket({
				host: 'localhost:8000',
				room: data.roomId
			});
		}
		return () => {
			console.log('destroy party socket');
			partySocket?.close();
		};
	});
	$effect(() => {
		console.log('data changed', data);
		if (partySocket) {
			partySocket.send(
				JSON.stringify({
					type: 'join',
					fromId: data.uid,
					from: data.uname
				})
			);
			// print each incoming message from the server to console
			partySocket.addEventListener('message', (e) => {
				let data:
					| {
							type: 'message';
							from: string;
							fromId: string;
							data: string;
					  }
					| {
							type: 'system';
							data: string;
					  }
					| {
							type: 'join';
							id: string;
							name: string;
							color: string;
					  }
					| {
							type: 'participants';
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
					| {
							type: 'leave';
							id: string;
					  }
					| {
							type: 'ready';
							id: string;
							isReady: boolean;
					  }
					| {
							type: 'start';
					  } = JSON.parse(e.data);
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
					case 'participants': {
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
		}
	});
</script>

<h1>Room: {data.roomId}</h1>
{#if data.uname}
	Hi, {data.uname}!
	{#if partySocket}
		<form
			on:submit={(e) => {
				e.preventDefault();
				console.log("Client: ",(e.target! as any).message.value);
				partyMsg((e.target! as any).message.value);
				(e.target! as any).message.value = '';
			}}
			class="grid grid-cols-4 items-center gap-4"
		>
			<input
				type="text"
				name="message"
				placeholder="Type your message here"
				class="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
			/>
			<button type="submit">Send!</button>
		</form>
		<div>
			{#if roomPlayers.length === 0}
				<p>No players yet</p>
			{:else}
				<div class="flex flex-col">
					{#each roomPlayers as player}
						<div style={`color: ${player.color}`}>
							<b>{player.name}</b> :{player.isReady ? 'Ready' : 'Not ready'}
							{#if player.id === data.uid}
								<Button
									disabled={isGameInSession}
									on:click={() => {
										player.isReady = !player.isReady;
										partySocket?.send(
											JSON.stringify({
												type: 'ready',
												fromId: data.uid,
												isReady: player.isReady
											})
										);
									}}
								>
									{player.isReady ? 'Unready' : 'Ready'}
								</Button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
			{#if msgs.length === 0}
				<p>No messages yet</p>
			{:else}
				<div class="flex flex-col">
					{#each msgs as msg}
						<div>
							<b>{msg.sender}</b> : {msg.message}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
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
