<script lang="ts">
	import type PartySocket from 'partysocket';
	import { Button } from '$lib/components/ui/button/index.js';
	let {
		data,
		partySocket,
		msgs,
        roomPlayers,
        isGameInSession
	}: {
		data: {
			uname: string | undefined;
			url: string;
			uid: string | undefined;
			roomId: string;
		};
		partySocket: PartySocket | null;
		msgs: {
			sender: string;
			message: string;
		}[];
		roomPlayers: {
			id: string;
			name: string;
			color: string;
			isReady: boolean;
		}[];
        isGameInSession: boolean;
	} = $props();
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
</script>

<h1>Room: {data.roomId}</h1>
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
