// Initialize Leaflet map
const map = L.map('map').setView([51.5074, -0.1278], 10); // Centered on London
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch and display the GeoJSON data
fetch('data/london_boroughs.geojson') // Path to your GeoJSON file
    .then(response => response.json())
    .then(data => {
        // Add the GeoJSON layer to the map
        L.geoJSON(data, {
            style: {
                color: "#0066cc",      // Boundary lines (dark blue)
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

                        // Show tooltip with borough name
                        const tooltipContent = `<strong>${feature.properties.lad22nm}</strong>`; // Replace 'lad22nm' with the correct property
                        layer.bindTooltip(tooltipContent, {
                            permanent: false,
                            direction: "top",
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

                        // Close tooltip when mouse leaves
                        layer.closeTooltip();
                    }
                });

                // Add a popup for each borough (click interaction)
                layer.bindPopup(`
                <strong>${feature.properties.lad22nm}</strong><br>
                <strong>Mayor:</strong> ${feature.properties.Mayor}<br>
                <strong>Population:</strong> ${feature.properties.Population.toLocaleString()}<br>
                <strong>Budget (24/25):</strong> £${feature.properties['Budget (24/25)'].toLocaleString()}<br>
                <a href="${feature.properties.Website}" target="_blank">Visit Council Website</a>
                `);
            }
        }).addTo(map);
    });
