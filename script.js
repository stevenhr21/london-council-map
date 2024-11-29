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
        L.geoJSON(data, {
            style: {
                color: "#0066cc",
                weight: 2,
                opacity: 0.8,
                fillColor: "#66b3ff",
                fillOpacity: 0.2
            },
            onEachFeature: (feature, layer) => {
                // Extract properties safely with fallback values
                const boroughName = feature.properties.lad22nm || "Unknown Borough";
                const mayor = feature.properties.Mayor || "Information not available";
                const population = feature.properties.Population
                    ? feature.properties.Population.toLocaleString()
                    : "Data not available";
                const budget = feature.properties['Budget (24/25)']
                    ? `£${feature.properties['Budget (24/25)'].toLocaleString()}`
                    : "Data not available";
                const website = feature.properties.Website || "#";

                // Hover effects with popup showing all info
                layer.on({
                    mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 3,
                            color: '#ff7800',
                            fillOpacity: 0.5
                        });

                        // Show a popup with all info
                        layer.bindPopup(`
                            <div>
                                <strong>${boroughName}</strong><br>
                                <strong>Mayor:</strong> ${mayor}<br>
                                <strong>Population:</strong> ${population}<br>
                                <strong>Budget (24/25):</strong> ${budget}<br>
                                <a href="${website}" target="_blank">Visit Council Website</a>
                            </div>
                        `).openPopup();
                    },
                    mouseout: (e) => {
                        const layer = e.target;

                        // Close the popup immediately
                        layer.closePopup();

                        // Reset the layer's style
                        layer.setStyle({
                            weight: 2,
                            color: "#0066cc",
                            fillOpacity: 0.2
                        });
                    }
                });
            }
        }).addTo(map);
    })
    .catch(err => console.error("Failed to load GeoJSON data:", err));
