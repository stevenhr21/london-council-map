// Initialize Leaflet map
const map = L.map('map').setView([51.5074, -0.1278], 10); // Centered on London
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch and display the GeoJSON data
fetch('data/london_boroughs.json') // Path to your GeoJSON file
    .then(response => response.json())
    .then(data => {
        // Add the GeoJSON layer to the map
        L.geoJSON(data, {
            style: {
                color: "#3388ff",      // Blue boundary lines
                weight: 2,            // Line thickness
                opacity: 0.7,         // Line transparency
                fillColor: "#3388ff", // Fill color
                fillOpacity: 0.1      // Fill transparency
            },
            onEachFeature: (feature, layer) => {
                // Add a popup for each borough
                layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
            }
        }).addTo(map);
    });
