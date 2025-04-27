<script>
    let showInfo = false;
</script>

<main>
    <button class="info-button" on:click={() => (showInfo = !showInfo)}>
        About
    </button>

    {#if showInfo}
        <div class="info-window">
            <p>
                Find people for rideshares!
            </p>
        </div>
    {/if}
</main>

<style>
    .info-button {
        position: fixed;
        bottom: 10px;
        left: 10px;
        padding: 10px 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    }

    .info-button:hover {
        background-color: #0056b3;
    }

    /* Style for the info window */
    .info-window {
        position: fixed;
        bottom: 50px;
        left: 10px;
        width: 500px;
        padding: 15px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    .info-window p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: black;
    }
</style>
