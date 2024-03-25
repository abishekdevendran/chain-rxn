<script lang="ts">
	import '../app.pcss';
	import NavBar from '$lib/components/NavBar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	import { Toaster } from 'svelte-sonner';
	import { fly } from 'svelte/transition';
	let { children, data } = $props();
</script>

<svelte:head>
	<title>Chain Reaction Revisited</title>
</svelte:head>

<ModeWatcher />
<Toaster />
<ProgressBar class="text-primary" />
<NavBar uname={data.uname} />
{#key data.url}
	<main
		in:fly={{ x: -200, duration: 300, delay: 300 }}
		out:fly={{ x: 200, duration: 300 }}
		class="min-w-full min-h-svh"
	>
		<div class="container max-w-screen-lg items-center flex flex-col py-12">
			{@render children()}
		</div>
	</main>
{/key}
