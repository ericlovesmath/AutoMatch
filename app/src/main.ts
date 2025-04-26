import 'leaflet/dist/leaflet.css';
import './style.css';
import L from 'leaflet';

const map = L.map('map').setView([51.505, -0.09], 13);

type SelectionMode = 'from' | 'to';
let selection_mode : SelectionMode = 'from';
activate_from();

let from_marker : L.Marker<any> | null = null;
let to_marker : L.Marker<any> | null = null;

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add click handler
map.on('click', function(e) {
    const coord = e.latlng;
    const lat = coord.lat;
    const lng = coord.lng;

    if (selection_mode === 'from') {
        if (from_marker !== null) {
            map.removeLayer(from_marker);
        }
        from_marker = L.marker([lat, lng]).addTo(map);
    } else if (selection_mode === 'to') {
        if (to_marker !== null) {
            map.removeLayer(to_marker);
        }
        to_marker = L.marker([lat, lng]).addTo(map);
    }
});

function activate_from() {
    selection_mode = 'from';
    document.getElementById('from')?.classList.add('active');
    document.getElementById('to')?.classList.remove('active');
}

function activate_to() {
    selection_mode = 'to';
    document.getElementById('to')?.classList.add('active');
    document.getElementById('from')?.classList.remove('active');
}

document.getElementById('from')?.addEventListener('click', activate_from);
document.getElementById('to')?.addEventListener('click', activate_to);
