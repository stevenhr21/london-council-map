// Parse the borough name from the URL
const urlParams = new URLSearchParams(window.location.search);
const boroughSlug = urlParams.get("borough"); // Example: "barking-and-dagenham"

// Load GeoJSON data and populate the page
fetch("../data/london_boroughs.geojson")
    .then((response) => response.json())
    .then((data) => {
        // Find the borough's data using the slug
        const boroughData = data.features.find((feature) =>
            feature.properties.lad22nm.toLowerCase().replace(/\s+/g, "-") === boroughSlug
        );

        if (boroughData) {
            const props = boroughData.properties;

            // Update page content
            document.getElementById("borough-name").textContent = props.lad22nm;
            document.getElementById("leader").textContent = props.Leader || "N/A";
            document.getElementById("population").textContent = props.Population
                ? props.Population.toLocaleString()
                : "N/A";
            document.getElementById("budget").textContent = props["Budget (24/25)"]
                ? `£${props["Budget (24/25)"].toLocaleString()}`
                : "N/A";
            document.getElementById("website").href = props.Website || "#";
            document.getElementById("website").textContent = props.Website || "N/A";

            // Example of dynamic statistic (Population Density)
            const density = props.Population / props.Area || "N/A"; // Assuming "Area" is in GeoJSON
            document.getElementById("density").textContent = density
                ? density.toFixed(2) + " / km²"
                : "N/A";
            document.getElementById("density-diff").textContent = density
                ? `${(density - 1500).toFixed(2)}`
                : "N/A";
        } else {
            document.getElementById("borough-name").textContent = "Borough Not Found";
        }
    })
    .catch((error) => console.error("Error loading GeoJSON data:", error));
