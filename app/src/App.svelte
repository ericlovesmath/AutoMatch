<script lang="ts">
    import Map from "./lib/Map.svelte";
    import Info from "./lib/Info.svelte";
    import Chat from "./lib/Chat.svelte";
    import {
        type LocationInfo,
        type ContactInfo,
        sendMessage,
        submitUser,
    } from "./lib/WebsocketStore";
    import { onMount } from "svelte";
    import Matching from "./lib/Matching.svelte";
    import L from "leaflet";
    import { type ClientData } from "../../shared/types";

    type Phase = "location" | "info" | "matching" | "chat";
    let current_phase: Phase = "location";

    let locs: LocationInfo | null = null;
    let contact: ContactInfo | null = null;
    let match = false;

    // object mapping strings to LocationInfo
    let external_locs: any = [];

    function update_loc(l: LocationInfo | null) {
        locs = l;
        next_phase();
    }

    function update_info(c: ContactInfo | null) {
        // info section has submission for both map and info,
        // so don't let it press until all info is there
        if (locs !== null) {
            contact = c;
            next_phase();
        }
    }

    function next_phase() {
        if (locs === null) {
            current_phase = "info";
            return;
        }
        if (contact === null) {
            current_phase = "info";
            return;
        }
        if (current_phase == "info") {
            submitUser(ws, locs, contact);
        }

        if (!match) {
            current_phase = "matching";
            return;
        }
    }

    function send_msg(msg: string) {
        sendMessage(ws, "chat_message", msg);
    }

    function send_consent(consent: boolean) {
        sendMessage(ws, "consent", consent);
    }

    function set_matched() {
        match = true;
    }

    function set_phase_chat() {
        current_phase = "chat";
    }

    let chat: string[] = [];

    let ws: WebSocket | null = null;
    let disconnected = true;

    function initWebSocket(url: string) {
        ws = new WebSocket(url);

        ws.onopen = () => {
            disconnected = false;
        };

        ws.onmessage = (e) => {
            const res: { type: string; msg: any } = JSON.parse(e.data);

            switch (res.type) {
                case "status":
                    // alert(res.msg);
                    break;

                case "consent":
                    set_matched();
                    break;

                case "chat_start":
                    set_phase_chat();
                    break;

                case "chat_message":
                    chat = [...chat, `${res.msg.name}: ${res.msg.msg}`];
                    break;

                case "map_update":
                    let { type, data }: { type: string; data: ClientData } =
                        res.msg;
                    console.log(res.msg);
                    let { name, from, to } = data;
                    if (type == "add") {
                        external_locs[name] = {
                            from: new L.LatLng(from.latitude, from.longitude),
                            to: new L.LatLng(to.latitude, to.longitude),
                            from_radius: from.radius,
                            to_radius: to.radius,
                        };
                    } else if (type == "remove") {
                        delete external_locs[name];
                    } else {
                        alert("unknown map_update action " + type);
                    }
                    break;

                default:
                    console.error("Unknown response type:", res.type);
            }
        };

        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onclose = () => {
            disconnected = true;
        };
    }

    onMount(() => initWebSocket("ws://localhost:8080"));
</script>

<main style="display: flex; flex: row; height:100vh; width:100vw">
    {#if disconnected}
        <div class="disconnected"></div>
    {/if}

    <Map
        {update_loc}
        selecting_locations={current_phase == "info"}
        external_selections={external_locs}
    />

    <!-- sidebar -->
    <div style="width: 30vw;">
        {#if current_phase == "info"}
            <Info update={update_info} />
        {:else if current_phase == "matching"}
            <Matching matched={match} send_consent={send_consent} />
        {:else if current_phase == "chat"}
            <Chat {chat} send_message={send_msg} />
        {/if}
    </div>
</main>

<style>
    .disconnected {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 4000;
        background-color: rgba(1, 1, 1, 0.3);
    }
</style>
