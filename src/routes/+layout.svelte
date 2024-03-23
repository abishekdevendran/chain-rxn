<script lang="ts">
	import '../app.pcss';
	import NavBar from '$lib/components/NavBar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	let { children, data } = $props();
</script>

<svelte:head>
	<title>Chain Reaction Revisited</title>
</svelte:head>

<ModeWatcher />
<ProgressBar class="text-primary" />
<NavBar uname={data.uname} />
<div class="container max-w-screen-lg items-center flex flex-col py-12">
	{@render children()}
</div>
