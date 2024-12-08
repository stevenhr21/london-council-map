// Initialize Leaflet map
const map = L.map('map').setView([51.5074, -0.1278], 10); // Centered on London
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let geojsonLayer; // To hold the GeoJSON layer for use in search functionality
let boroughs = []; // To store borough names for autocomplete

// Fetch and display the GeoJSON data
fetch('data/london_boroughs.geojson') // Path to your GeoJSON file
    .then(response => response.json())
    .then(data => {
        geojsonLayer = L.geoJSON(data, {
            style: {
                color: "#0066cc",
                weight: 2,
                opacity: 0.8,
                fillColor: "#66b3ff",
                fillOpacity: 0.2
            },
            onEachFeature: (feature, layer) => {
                const boroughName = feature.properties.lad22nm || "Unknown Borough";
                const leader = feature.properties.Leader || "Information not available";
                const population = feature.properties.Population
                    ? feature.properties.Population.toLocaleString()
                    : "Data not available";
                const budget = feature.properties['Budget (24/25)']
                    ? `£${feature.properties['Budget (24/25)'].toLocaleString()}`
                    : "Data not available";
                const website = feature.properties.Website || "#";

                // Add button link for 'Find out more'
                const findOutMoreLink = `borough_pages/${boroughName.replace(/\s+/g, '-').toLowerCase()}.html`;

                // Hover effects
                layer.on({
                    mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 3,
                            color: '#ff7800',
                            fillOpacity: 0.5
                        });
                        layer.bindTooltip(
                            `<strong>${boroughName}</strong>`,
                            { permanent: false, direction: "top", className: "hover-tooltip" }
                        ).openTooltip();
                    },
                    mouseout: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 2,
                            color: "#0066cc",
                            fillOpacity: 0.2
                        });
                        layer.closeTooltip();
                    }
                });

                // Popup with detailed information and button
                layer.bindPopup(`
                    <strong>${boroughName}</strong><br>
                    <strong>Leader:</strong> ${leader}<br>
                    <strong>Population:</strong> ${population}<br>
                    <strong>Budget (24/25):</strong> ${budget}<br>
                    <a href="${website}" target="_blank">Visit Council Website</a><br>
                    <button 
                        onclick="window.location.href='${findOutMoreLink}'" 
                        style="margin-top: 10px; padding: 5px 10px; background-color: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Find out more
                    </button>
                `);
            }
        }).addTo(map);

        // Custom search functionality (unchanged from previous)
        const searchBox = document.getElementById('search-box');
        const dropdown = document.createElement('ul');
        dropdown.id = 'autocomplete-dropdown';
        dropdown.style.position = 'absolute';
        dropdown.style.backgroundColor = '#fff';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.listStyle = 'none';
        dropdown.style.padding = '0';
        dropdown.style.margin = '0';
        dropdown.style.maxHeight = '150px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.width = `${searchBox.offsetWidth}px`;
        dropdown.style.zIndex = '1000';
        dropdown.style.display = 'none'; // Hidden by default
        searchBox.parentElement.appendChild(dropdown);

        searchBox.addEventListener('input', function (e) {
            const query = e.target.value.toLowerCase();
            dropdown.innerHTML = ''; // Clear previous suggestions

            if (query.length === 0) {
                dropdown.style.display = 'none'; // Hide dropdown if query is empty
                return;
            }

            // Filter borough names based on the input
            const suggestions = boroughs.filter(borough =>
                borough.toLowerCase().includes(query)
            );

            // Populate the dropdown with suggestions
            suggestions.forEach(suggestion => {
                const listItem = document.createElement('li');
                listItem.textContent = suggestion;
                listItem.style.padding = '5px';
                listItem.style.cursor = 'pointer';

                listItem.addEventListener('click', () => {
                    // Find the layer corresponding to the clicked suggestion
                    geojsonLayer.eachLayer(function (layer) {
                        if (layer.feature.properties.lad22nm === suggestion) {
                            const bounds = layer.getBounds();
                            map.fitBounds(bounds); // Zoom to the selected borough
                            layer.openPopup(); // Open the popup
                        }
                    });

                    searchBox.value = suggestion; // Update the search box with the selected suggestion
                    dropdown.style.display = 'none'; // Hide the dropdown
                });

                dropdown.appendChild(listItem);
            });

            dropdown.style.display = 'block'; // Show the dropdown
        });

        // Hide the dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    })
    .catch(err => console.error("Failed to load GeoJSON data:", err));
