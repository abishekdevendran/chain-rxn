<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	let { data, form } = $props();
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label/index.js';
	import Loader from '$lib/components/Loader.svelte';
	let dialogOpen = $state(true);
	let isGoingToJoin = $state(false);
</script>

{#if data.uname}
	<p>Welcome back, {data.uname}!</p>
	<div class="flex items-center flex-col justify-center gap-2">
		<h2>Create (or) Join by ID:</h2>
		<div class="grid grid-cols-4 items-center gap-4">
			<form
				use:enhance={({formData}) => {
				const id = formData.get('id') as string;
				isGoingToJoin = true;
						goto(`/${id}`);
					}}
				action="?/join"
				method="post"
			>
				<input
					type="text"
					name="id"
					placeholder="Enter ID"
					class="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					required
					minlength={6}
					maxlength={6}
				/>
				<Button type="submit" disabled={isGoingToJoin}>
					{#if isGoingToJoin}
						Joining <Loader />
					{:else}
						Join!
					{/if}
				</Button>
			</form>
		</div>
		(or)
		<h2>Join any of the ones listed below:</h2>
	</div>
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
