<script lang="ts">
    let { matched, send_consent } = $props<{
        matched: boolean;
        send_consent: (consent: boolean) => void;
    }>();
</script>

<main>
    <h2>Matching</h2>

    <div>
        {#if matched}
            <p>Found match</p>
            <button onclick={() => send_consent(true)}>Send Consent</button>
            <button onclick={() => send_consent(false)}>Reject Consent</button>
        {:else}
            <p>Looking for match...</p>
        {/if}
    </div>
</main>
