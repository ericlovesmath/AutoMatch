<script lang="ts">
    import type { ClientData } from "../../../shared/types";

    let { matched, send_consent } = $props<{
        matched: ClientData | null;
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
