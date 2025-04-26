<script lang="ts">
    import "leaflet/dist/leaflet.css";
    import L from "leaflet";
    import { onMount } from "svelte";

    let map: L.Map;
    type Selection = "from" | "to" | "submit";
    type SubSelection = "marker" | "radius";
    let selection_mode: Selection = "from";
    let subselection: SubSelection = "marker";

    type Markers = {
        marker: {
            from: L.Marker | null;
            to: L.Marker | null;
        };
        radius: {
            from: L.Circle | null;
            to: L.Circle | null;
        };
    };

    const markers: Markers = {
        marker: { from: null, to: null },
        radius: { from: null, to: null },
    };

    onMount(() => {
        map = L.map("map").setView([51.505, -0.09], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        map.on("click", (e) => {
            const coord = e.latlng;
            if (selection_mode === "submit") return;

            if (subselection === "marker") {
                clear(selection_mode);
                markers.marker[selection_mode] = L.marker([
                    coord.lat,
                    coord.lng,
                ]).addTo(map);
                markers.radius[selection_mode] = L.circle(
                    [coord.lat, coord.lng],
                    {
                        radius: 0,
                    },
                ).addTo(map);
                subselection = "radius";
            } else if (subselection === "radius") {
                if (!is_valid("from")) {
                    activate_from();
                } else if (!is_valid("to")) {
                    activate_to();
                } else {
                    selection_mode = "submit";
                }
            }
        });

        map.addEventListener("mousemove", (e) => {
            const coord = e.latlng;
            if (selection_mode === "submit") return;

            if (subselection === "radius") {
                const r = L.latLng(coord.lat, coord.lng).distanceTo(
                    markers.marker[selection_mode]!.getLatLng(),
                );
                markers.radius[selection_mode]?.setRadius(r);
            }
        });
    });

    function clear(mode: "from" | "to") {
        if (markers.marker[mode] !== null) {
            map.removeLayer(markers.marker[mode]!);
            markers.marker[mode] = null;
        }
        if (markers.radius[mode]) {
            map.removeLayer(markers.radius[mode]!);
            markers.radius[mode] = null;
        }
    }

    function is_valid(mode: "from" | "to") {
        return markers.marker[mode] !== null && markers.radius[mode] !== null;
    }

    function activate_from() {
        selection_mode = "from";
        subselection = "marker";
        clear("from");
    }

    function activate_to() {
        selection_mode = "to";
        subselection = "marker";
        clear("to");
    }

    function submit() {
        alert("submitting");
    }
</script>

<main style="flex: 0 1 auto; width: 100%; height: 100%;">
    <div class="header">
        <button
            class="header-instr"
            class:active={selection_mode === "from"}
            on:click={activate_from}>From</button
        >
        <button
            class="header-instr"
            class:active={selection_mode === "to"}
            on:click={activate_to}>To</button
        >
        <button
            id="submit"
            class="header-instr"
            class:active={selection_mode === "submit"}
            on:click={submit}>Submit</button
        >
    </div>
    <div id="map"></div>
</main>

<style>
    .header {
        display: flex;
        flex-direction: row;
        gap: 20px;
        justify-content: center;
    }

    .header-instr {
        padding: 20px;
    }

    .active {
        background-color: #333388;
    }

    #map {
        width: 100%;
        height: 100%;
    }

    #submit {
        color: #777777;
    }

    #submit.active {
        color: #ffffff;
        background-color: #338833;
    }

    button {
      all: unset;
    }
</style>
