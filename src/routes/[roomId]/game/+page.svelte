<script lang="ts">
    import { roomStore } from '$lib/stores/roomState.svelte.js';
    import { beforeNavigate } from '$app/navigation';
    let { data, form } = $props();
    roomStore.partySocket = data.partySocket ?? null;
    beforeNavigate(() => {
		if (roomStore.partySocket && roomStore.partySocket.readyState === WebSocket.OPEN) {
			console.log('Closing socket on Navigating away');
			roomStore.partySocket?.close();
			roomStore.partySocket = null;
		}
	});
</script>