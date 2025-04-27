<script lang="ts">
    import "leaflet/dist/leaflet.css";
    import L from "leaflet";
    import { onMount } from "svelte";
    import { type LocationInfo } from "./WebsocketStore";

    let map: L.Map;
    type Selection = "from" | "to" | "none";
    type SubSelection = "marker" | "radius";
    let selection_mode: Selection = $state("from");
    let subselection: SubSelection = "marker";

    let { update_loc, selecting_locations, external_selections } = $props<{
        update_loc: (l: LocationInfo) => void;
        selecting_locations: boolean;
        external_selections: any;
    }>();

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
        map = L.map("map").setView([34.14051944496899, -118.1231997613347], 40);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        map.on("click", (e) => {
            const coord = e.latlng;
            if (selection_mode === "none") return;

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
                    selection_mode = "none";
                    update_loc({
                        from: markers.marker.from!.getLatLng(),
                        to: markers.marker.to!.getLatLng(),
                        from_radius: markers.radius.from!.getRadius(),
                        to_radius: markers.radius.to!.getRadius(),
                    });
                }
            }
        });

        map.addEventListener("mousemove", (e) => {
            const coord = e.latlng;
            if (selection_mode === "none") return;

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

    let other_markers: L.Circle[] = [];
    $effect(() => {
        console.log("redrawing");

        for (let m of other_markers) {
            map.removeLayer(m);
        }
        other_markers = [];

        for (let key in external_selections) {
            let l: LocationInfo = external_selections[key];
            other_markers.push(
                L.circle([l.from.lat, l.from.lng], {
                    radius: l.from_radius,
                    stroke: false,
                    color: "green"
                }).addTo(map),
            );
            other_markers.push(
                L.circle([l.to.lat, l.to.lng], {
                    radius: l.to_radius,
                    stroke: false,
                    color: "green"

                }).addTo(map),
            );
        }
    });
</script>

<main style="flex-grow: 1; position: relative;">
    <div id="map"></div>
    <div class="header">
        {#if selecting_locations}
            <button
                class="header-instr"
                class:active={selection_mode === "from"}
                onclick={activate_from}>From</button
            >
            <button
                class="header-instr"
                class:active={selection_mode === "to"}
                onclick={activate_to}>To</button
            >
        {/if}
    </div>
</main>

<style>
    .header {
        position: relative;
        top: 50px;
        left: 0;
        display: flex;
        flex-direction: row;
        gap: 50px;
        justify-content: center;
        z-index: 400;
    }

    .header-instr {
        padding: 20px;
    }

    .active {
        background-color: #333388;
    }

    #map {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    button {
        all: unset;
        background-color: rgba(0.2, 0.2, 0.2, 0.8);
    }
</style>
