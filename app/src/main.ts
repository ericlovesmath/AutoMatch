import 'leaflet/dist/leaflet.css';
import './style.css';
import L from 'leaflet';

const map = L.map('map').setView([51.505, -0.09], 13);

type Selection = 'from' | 'to' | 'submit';
type SubSelection = 'marker' | 'radius';
let selection_mode: Selection = 'from';
let subselection: SubSelection = 'marker';

type markers = {
    marker: {
        from: L.Marker | null;
        to: L.Marker | null;
    };
    radius: {
        from: L.Circle | null;
        to: L.Circle | null;
    };
};

const markers: markers = {
    marker: {
        from: null,
        to: null
    },
    radius: {
        from: null,
        to: null
    }
};

activate_from();

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

map.on('click', function(e) {
    const coord = e.latlng;
    const lat = coord.lat;
    const lng = coord.lng;

    if (selection_mode == 'submit') {
        return;
    }

    if (subselection == 'marker') {
        if (markers.marker[selection_mode] !== null) {
            map.removeLayer(markers.marker[selection_mode]!);
        }
        markers.marker[selection_mode] = L.marker([lat, lng]).addTo(map);
        markers.radius[selection_mode] = L.circle([lat, lng], {
            radius: 0
        }).addTo(map);
        subselection = 'radius';
    } else if (subselection == 'radius') {
        if (selection_mode == "from") {
            activate_to();
        } else if (selection_mode == "to") {
            activate_submit();
        }
    }
});

map.addEventListener('mousemove', e => {
    const coord = e.latlng;
    const lat = coord.lat;
    const lng = coord.lng;

    if (selection_mode == 'submit') {
        return;
    }
        
    if (subselection == 'radius') {
        const r = L.latLng(lat, lng).distanceTo(markers.marker[selection_mode]!.getLatLng());
        markers.radius[selection_mode]!.setRadius(r);
        console.log("distance is " + markers.radius[selection_mode]);
    }
});

function activate_from() {
    selection_mode = 'from';
    subselection = 'marker';
    markers.radius.from = null;
    document.getElementById('from')?.classList.add('active');
    document.getElementById('to')?.classList.remove('active');
    document.getElementById('submit')?.classList.remove('active');
}

function activate_to() {
    selection_mode = 'to';
    subselection = 'marker';
    markers.radius.to = null;
    document.getElementById('from')?.classList.remove('active');
    document.getElementById('to')?.classList.add('active');
    document.getElementById('submit')?.classList.remove('active');
}

function activate_submit() {
    selection_mode = 'submit';
    markers.radius.to = null;
    document.getElementById('from')?.classList.remove('active');
    document.getElementById('to')?.classList.remove('active');
    document.getElementById('submit')?.classList.add('active');
}

function submit() {
    console.log("submitting")
}

document.getElementById('from')?.addEventListener('click', activate_from);
document.getElementById('to')?.addEventListener('click', activate_to);
document.getElementById('submit')?.addEventListener('click', submit);
