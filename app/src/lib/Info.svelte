<script lang="ts">
    import {
        chat,
        sendMessage,
        initWebSocket,
        contact_info,
        state,
        location_info,
        submitUser
    } from "./WebsocketStore";

    function submit_info(e : any) {
        e.preventDefault();
        $contact_info = {
            name: e.target.name.value,
            phone: e.target.phone.value,
        };

        submitUser($location_info, $contact_info);

        $state = "chat";
    }
</script>

<main class="popup">
    <div class="popup-content">
        <h2>Info collect</h2>
        <p>Enter your information</p>
        <form on:submit={submit_info}>
            <input type="text" name="name" placeholder="Zack Huang" />
            <input type="text" name="phone" placeholder="(383) 783-9827" />
            <input type="submit" value="Submit" />
        </form>
    </div>
</main>

<style>
    .popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5); /* semi-transparent background */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
    }

    /* Inner popup box */
    .popup-content {
        background: white;
        color: black;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 100%;
        text-align: center;
    }
</style>
