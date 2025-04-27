<script>
    let showInfo = false;
</script>

<main>
    <button class="info-button" on:mouseenter={() => (showInfo = true)} on:mouseleave={() => (showInfo = false)}>
        About
    </button>

    {#if showInfo}
        <div class="info-window">
            <p>
                AutoMatch creates carpools by allowing a range of starting/ending locations to be specified.  Whenever there are overlapping ranges, users are given the option to accept the match and share a ride with the other person. If they both choose to do this, a start/end location shared by both users is automatically chosen and a chat window is opened to allow for further communication. AutoMatch respects users' privacy by not revealing identities until there is a match, and by avoiding using exact starting/ending locations.
            </p>
        </div>
    {/if}
</main>

<style>
    .info-button {
        position: fixed;
        bottom: 15px;
        left: 15px;
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
