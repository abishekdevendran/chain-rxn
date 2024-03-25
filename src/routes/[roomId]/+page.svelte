<script lang="ts">
	import PartySocket from 'partysocket';
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label/index.js';
	let dialogOpen = $state(true);
	// connect to our server
	let partySocket = $state(
		data.uname
			? new PartySocket({
					host: 'localhost:8000',
					room: data.roomId
				})
			: null
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
		if (partySocket) {
			// send a message to the server
			partySocket.send('Hello everyone');

			// print each incoming message from the server to console
			partySocket.addEventListener('message', (e) => {
				console.log(e.data);
			});
		}
	});
</script>

<h1>Room: {data.roomId}</h1>
{#if data.uname}
	Hi, {data.uname}!
	{#if partySocket}
		<div class="grid grid-cols-4 items-center gap-4">
			<form
				on:submit={(e) => {
			e.preventDefault();
			console.log("Client: ",(e.target! as any).message.value);
			partySocket?.send((e.target! as any).message.value);
			(e.target! as any).message.value = '';
		}}
			>
				<input
					type="text"
					name="message"
					placeholder="Type your message here"
					class="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				/>
				<button type="submit">Send!</button>
			</form>
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
