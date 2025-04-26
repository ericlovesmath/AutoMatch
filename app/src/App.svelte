<script lang="ts">
    import Map from "./lib/Map.svelte";
    import Info from "./lib/Info.svelte";
    import Chat from "./lib/Chat.svelte";
    import {
        type LocationInfo,
        type ContactInfo,
        type MessageType,
        sendMessage,
        submitUser,
    } from "./lib/WebsocketStore";
    import { onMount } from "svelte";
    import Matching from "./lib/Matching.svelte";

    type MatchInfo = string;

    type Phase = "location" | "info" | "matching" | "chat";
    let current_phase: Phase = "location";

    let locs: LocationInfo | null = null;
    let contact: ContactInfo | null = null;
    let match: MatchInfo | null = null;

    function handleConsent() {
        sendMessage(ws, "consent", true as any);
    }

    function update_loc(l: LocationInfo | null) {
        locs = l;
        next_phase();
    }

    function update_info(c: ContactInfo | null) {
        contact = c;
        next_phase();
    }

    function next_phase() {
        if (locs === null) {
            current_phase = "location";
            return;
        }
        if (contact === null) {
            current_phase = "info";
            return;
        }
        submitUser(ws, locs, contact);
        handleConsent();

        if (match === null) {
            current_phase = "matching";
            return;
        }

        current_phase = "chat";
    }

    function send_msg(msg: string) {
        sendMessage(ws, "chat_message", msg);
    }

    let chat: string[] = [];

    let ws: WebSocket | null = null;

    function initWebSocket(url: string) {
        ws = new WebSocket(url);

        ws.onmessage = (e) => {
            const res: { type: string; msg: string } = JSON.parse(e.data);

            switch (res.type) {
                case "status":
                    // alert(res.msg);
                    break;

                case "consent":
                    // alert(res.msg);
                    break;

                case "chat_start":
                    // alert("TODO: RELEASE CHAT INTERFACE HERE");
                    // releaseChatInterface();
                    break;

                case "chat_message":
                    // alert("TODO: UPDATE CHAT INTERFACE HERE");
                    chat.push(res.msg);
                    break;

                default:
                    console.error("Unknown response type:", res.type);
            }
        };

        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onclose = () => console.log("WebSocket connection closed");
    }

    onMount(() => initWebSocket("ws://localhost:8080"));
</script>

<main style="display: flex; flex: row; height:100vh; width:100vw">
    <Map {update_loc} selecting_locations={current_phase == "location"} />

    <!-- sidebar -->
    <div style="width: 30vw;">
        {#if current_phase == "info"}
            <Info update={update_info} />
        {:else if current_phase == "matching"}
            <Matching />
        {:else if current_phase == "chat"}
            <Chat {chat} send_message={send_msg} />
        {/if}
    </div>
</main>
