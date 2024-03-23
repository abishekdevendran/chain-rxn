<script lang="ts">
	import { enhance } from '$app/forms';
	import DarkToggle from '$lib/components/DarkToggle.svelte';
	let {
		uname
	}: {
		uname: string | undefined;
	} = $props();
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Loader from '$lib/components/Loader.svelte';
	let isLoading = $state(false);
	let dialogOpen = $state(false);
	let errorMsg = $state('');
	import { page } from '$app/stores';
</script>

<nav
	class="sticky top-0 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
		{#if $page.url.pathname === '/'}
			<div class="mr-4 hidden md:flex">Chain Reaction</div>
		{:else}
			<a href="/" class="mr-4 hidden md:flex">Chain Reaction</a>
		{/if}
		<div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
			{#if uname}
				<Avatar.Root>
					<Avatar.Fallback>{uname.slice(0, 1).toUpperCase()}</Avatar.Fallback>
				</Avatar.Root>
				<Dialog.Root bind:open={dialogOpen}>
					<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}
						>Edit Profile</Dialog.Trigger
					>
					<Dialog.Content class="sm:max-w-[425px]">
						<Dialog.Header>
							<Dialog.Title>Edit profile</Dialog.Title>
							<Dialog.Description>
								Make changes to your profile here. Click save when you're done.
							</Dialog.Description>
						</Dialog.Header>
						<form
							class="grid gap-4 py-4"
							use:enhance={() => {
								isLoading = true;
								return async ({ update, result }) => {
									update();
									isLoading = false;
									if (result.type !== 'failure') {
										errorMsg = '';
										dialogOpen = false;
									} else {
										if(result.data){
											errorMsg = result.data.error as string ?? 'An error occurred';
										}
									}
								};
							}}
							action="/?/name"
							method="post"
						>
							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="username" class="text-right">New Username</Label>
								<input
									id="username"
									name="uname"
									class="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Enter your username"
									required
									minlength={3}
									maxlength={20}
								/>
								{#if errorMsg}
									<p class="col-span-4 text-sm text-red-500">{errorMsg}</p>
								{/if}
							</div>
							<Dialog.Footer>
								<Button type="submit" disabled={isLoading}>
									{#if isLoading}
										<Loader />
									{:else}
										Save changes
									{/if}
								</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			{/if}
			<DarkToggle />
		</div>
	</div>
</nav>
