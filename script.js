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
                color: "#0066cc",      // Boundary Lines (dark blue)
                weight: 2,            // Line thickness
                opacity: 0.8,         // Line transparency
                fillColor: "#66b3ff", // Fill color
                fillOpacity: 0.2      // Fill transparency
            },
            onEachFeature: (feature, layer) => {
                // Add event listeners for hover effects
                layer.on({
                    mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 3,
                            color: '#ff7800',     // Highlight color (orange)
                            fillOpacity: 0.5     // Slightly less transparent fill
                        });
                        layer.bindTooltip(`<strong>${feature.properties.lad22nm}</strong>`, {
                            permanent: false,
                            direction: "center",
                            className: "hover-tooltip"
                        }).openTooltip();
                    },
                    mouseout: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 2,
                            color: "#0066cc",     // Reset to original color
                            fillOpacity: 0.2
                        });
                        map.closeTooltip();
                    }
                });

                // Add a popup for each borough
                layer.bindPopup(`<strong>${feature.properties.lad22nm}</strong>`);
            }
        }).addTo(map);
    });
