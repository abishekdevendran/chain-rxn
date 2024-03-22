<script lang="ts">
    import "../app.css";
    let { children } = $props();
</script>

<svelte:head>
    <title>Chain Reaction Revisited</title>
</svelte:head>
{@render children()}