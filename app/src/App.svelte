<script lang="ts">
    import Map from "./lib/Map.svelte";
    import Modal from "./lib/Modal.svelte";
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
    import { type ClientData, type Response } from "../../shared/types";

    type Phase = "info" | "matching" | "chat";
    let current_phase: Phase = "info";

    let locs: LocationInfo | null = null;
    let contact: ContactInfo | null = null;
    let match: ClientData | null = null;
    let waiting_for_other = false;
    let chat_started = false;

    let map_component : Map;

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
        // get info if we don't have location
        if (locs === null) {
            current_phase = "info";
            return;
        }
        // get info if we don't have contact info
        if (contact === null) {
            current_phase = "info";
            return;
        }
        // if we have all of the info and are still in
        // the info phase, register user
        if (current_phase == "info") {
            map_component.get_map().fitBounds([
                [locs.from.lat, locs.from.lng],
                [locs.to.lat, locs.to.lng]
            ]);
            submitUser(ws, locs, contact);
        }

        // matching phase until chat starts
        if (!chat_started) {
            current_phase = "matching";
            return;
        }

        current_phase = "chat";
    }

    function send_msg(msg: string) {
        sendMessage(ws, "chat_message", msg);
    }

    function send_consent(consent: boolean) {
        sendMessage(ws, "consent", consent);
        waiting_for_other = true;
    }

    function set_matched(data: ClientData | null) {
        match = data;
        waiting_for_other = false;
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
            const res: Response = JSON.parse(e.data);

            switch (res.type) {
                case "notify_status":
                    // alert(res.msg);
                    break;

                case "request_consent": {
                    const data = res.msg as ClientData;
                    set_matched(data);
                    break;
                }

                case "notify_match_rejected": {
                    set_matched(null);
                    break;
                }

                case "notify_chat_start":
                    chat_started = true;
                    next_phase();
                    break;

                case "notify_chat_message":
                    chat = [...chat, `${res.msg.name}: ${res.msg.msg}`];
                    break;

                case "notify_map_update":
                    let { type, data }: { type: string; data: ClientData } =
                        res.msg;
                    // Map Pretty Section
                    let { name, from, to } = data;
                    if (type == "add") {
                        external_locs[name] = {
                            from: new L.LatLng(from.latitude, from.longitude),
                            to: new L.LatLng(to.latitude, to.longitude),
                            from_radius: from.radius,
                            to_radius: to.radius,
                        };
                        external_locs = { ...external_locs };
                    } else if (type == "remove") {
                        delete external_locs[name];
                        external_locs = { ...external_locs };
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
        bind:this={map_component}
    />
    <Modal />

    <!-- sidebar -->
    <div class="sidebar">
        <div id="logoContainer">
            <span class="logo-icon">🚗</span>
            <h1 class="logo-text">AutoMatch</h1>
        </div>
        {#if current_phase == "info"}
            <Info update={update_info} />
        {:else if current_phase == "matching"}
            <Matching matched={match} {send_consent} {waiting_for_other} />
        {:else if current_phase == "chat"}
            <Chat {chat} send_message={send_msg} />
        {/if}

        <div id="footer">
            <p>
                Made with ❤️ by
                <a href="https://bradybhalla.github.io/">Brady Bhalla</a>
                and
                <a href="https://www.ericchanlee.com">Eric Lee</a>
            </p>
        </div>
    </div>
</main>

<style>
    main {
        font-family: Arial, sans-serif;
    }

    .disconnected {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 4000;
        background-color: rgba(1, 1, 1, 0.3);
    }

    .sidebar {
        padding: 1rem;
        width: 30vw;
        background-color: #282c32;
        box-shadow: 10px 0 5px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        font-size: 1rem;
        line-height: 1.5;
        color: pearl;
    }

    #logoContainer {
        width: 100%;
        text-align: center;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 0;
        gap: 10px;
    }

    .logo-icon {
        font-size: 2rem;
        color: #007bff;
        animation: bounce 2s infinite;
    }

    .logo-text {
        font-size: 2rem;
        font-weight: bold;
        color: #ddd;
        margin: 0;
        opacity: 0;
        transform: translateX(-20px);
        animation: slideIn 1s ease-out forwards;
    }

    @keyframes bounce {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes slideIn {
        0% {
            opacity: 0;
            transform: translateX(20px);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }

    #footer {
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 0 1rem;
        color: #eee;
    }

    #footer a {
        color: skyblue;
        transition: color 0.3s ease;
    }
</style>
