<!-- Map display and interactivity -->

<script lang="ts">
    import "leaflet/dist/leaflet.css";
    import L from "leaflet";
    import "leaflet-control-geocoder";
    import "leaflet-control-geocoder/dist/Control.Geocoder.css";
    import { onMount } from "svelte";
    import { type LocationInfo } from "./types";
    import type { Path } from "../../../shared/types";

    let map: L.Map;
    let marker_layer: L.LayerGroup;
    type Selection = "from" | "to" | "none";
    type SubSelection = "marker" | "radius";
    let selection_mode: Selection = $state("from");
    let subselection: SubSelection = $state("marker");

    let { update_loc, selecting_locations, external_selections } = $props<{
        update_loc: (l: LocationInfo) => void;
        selecting_locations: boolean;
        external_selections: any;
    }>();

    // map utils which can be used externally
    export function zoom_to_points(pts: L.LatLngTuple[]) {
        map.fitBounds(pts);
    }

    export function show_final_path(final_path: Path) {
        marker_layer.removeFrom(map);
        let from: L.LatLngTuple = [final_path.from_lat, final_path.from_lng];
        let to: L.LatLngTuple = [final_path.to_lat, final_path.to_lng];
        L.marker(from, { icon: greenIcon }).addTo(map);
        L.marker(to).addTo(map);
        L.polyline([from, to], {
          color: 'black',
          weight: 3,
          dashArray: '5, 10', // 5px line, 10px gap
        }).addTo(map);
        zoom_to_points([from, to]);
    }

    // storage of markers on the map
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

    var greenIcon = new L.Icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    onMount(() => {
        // create map
        map = L.map("map").setView([34.14051944496899, -118.1231997613347], 40);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // create layer to hold markers
        marker_layer = L.layerGroup().addTo(map);

        // search bar
        L.Control.geocoder({
            defaultMarkGeocode: false, // Prevent automatic marker placement
            position: "bottomright",
            collapsed: false,
        })
            .on("markgeocode", (e: any) => {
                const bbox = e.geocode.bbox;
                const poly = L.polygon([
                    [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
                    [bbox.getNorthEast().lat, bbox.getNorthEast().lng],
                    [bbox.getNorthWest().lat, bbox.getNorthWest().lng],
                    [bbox.getSouthWest().lat, bbox.getSouthWest().lng],
                ]);
                map.fitBounds(poly.getBounds()); // Zoom to the location
            })
            .addTo(map);

        // selecting locations and ranges
        map.on("click", (e) => {
            const coord = e.latlng;
            if (selection_mode === "none") return;

            if (subselection === "marker") {
                clear(selection_mode);
                markers.marker[selection_mode] = L.marker(
                    [coord.lat, coord.lng],
                    selection_mode == "from" ? { icon: greenIcon } : {},
                ).addTo(marker_layer);
                markers.radius[selection_mode] = L.circle(
                    [coord.lat, coord.lng],
                    {
                        radius: 0,
                        color:
                            selection_mode === "from"
                                ? "var(--green)"
                                : "var(--blue)",
                        fillOpacity: 0.7,
                    },
                ).addTo(marker_layer);
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

        // selecting ranges
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

    // remove markers for a certain mode
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

    // check if marker and radius are set
    function is_valid(mode: "from" | "to") {
        return markers.marker[mode] !== null && markers.radius[mode] !== null;
    }

    // start selecting the from location
    function activate_from() {
        selection_mode = "from";
        subselection = "marker";
        clear("from");
    }

    // start selecting the to location
    function activate_to() {
        selection_mode = "to";
        subselection = "marker";
        clear("to");
    }

    // draw markers from other users
    let other_markers: L.Circle[] = [];
    $effect(() => {
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
                    color: "var(--green)",
                    fillOpacity: 0.5,
                }).addTo(marker_layer),
            );
            other_markers.push(
                L.circle([l.to.lat, l.to.lng], {
                    radius: l.to_radius,
                    stroke: false,
                    color: "var(--blue)",
                    fillOpacity: 0.5,
                }).addTo(marker_layer),
            );
        }
    });
</script>

<main style="flex-grow: 1; position: relative;">
    <div id="map"></div>
    <div class="header">
        <button
            style:flex={selection_mode == "from" ? "4" : "1"}
            class="from"
            onclick={activate_from}
            disabled={!selecting_locations}
        >
            {#if selection_mode == "from" && subselection == "marker"}
                Click to select start location
            {:else if selection_mode == "from" && subselection == "radius"}
                Click again to set region size
            {:else}
                Start
            {/if}
        </button>
        <button
            style:flex={selection_mode == "to" ? "4" : "1"}
            class="to"
            onclick={activate_to}
            disabled={!selecting_locations}
        >
            {#if selection_mode == "to" && subselection == "marker"}
                Click to select destination
            {:else if selection_mode == "to" && subselection == "radius"}
                Click again to set region size
            {:else}
                Destination
            {/if}
        </button>
    </div>
</main>

<style>
    .header {
        position: relative;
        top: 50px;
        left: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        z-index: 400;
        width: 500px;
        margin: 0 auto;
    }

    #map {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    :global(.leaflet-tile) {
        filter: grayscale(70%);
    }

    button {
        height: 50px;
        border: none;
        color: white;
        font-size: 18px;
        transition: flex 0.3s;
        overflow-x: hidden;
        white-space: nowrap;
        cursor: pointer;
    }

    button.from {
        background-color: var(--green);
        border-radius: 8px 0 0 8px;
    }

    button.to {
        background-color: var(--blue);
        border-radius: 0 8px 8px 0;
    }

    button.from:disabled {
        background-color: var(--dark-green);
        color: var(--subtext);
    }

    button.to:disabled {
        background-color: var(--dark-blue);
        color: var(--subtext);
    }
</style>
