function getBoroughFromURL() {
    // Extract the borough name from the query string (e.g., ?borough=barking-and-dagenham)
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('borough');
}

function populateBoroughPage() {
    const boroughName = getBoroughFromURL();

    if (!boroughName) {
        console.error("No borough specified in the URL.");
        document.getElementById('borough-name').textContent = "Borough not found";
        return;
    }

    fetch('../data/london_boroughs.geojson') // Path to your GeoJSON file
        .then(response => response.json())
        .then(data => {
            // Find the matching borough in the GeoJSON data
            const boroughData = data.features.find(feature =>
                feature.properties.lad22nm.replace(/\s+/g, '-').toLowerCase() === boroughName
            );

            if (!boroughData) {
                console.error("Borough not found in GeoJSON.");
                document.getElementById('borough-name').textContent = "Borough not found";
                return;
            }

            // Extract relevant data
            const { lad22nm, Leader, Population, Budget, Website } = boroughData.properties;

            // Populate page content dynamically
            document.getElementById('borough-name').textContent = lad22nm;
            document.getElementById('leader').textContent = Leader || "Information not available";
            document.getElementById('population').textContent = Population
                ? Population.toLocaleString()
                : "Data not available";
            document.getElementById('budget').textContent = Budget
                ? `£${Budget.toLocaleString()}`
                : "Data not available";
            const websiteLink = document.getElementById('website');
            websiteLink.textContent = Website ? "Visit Council Website" : "Website not available";
            websiteLink.href = Website || "#";
        })
        .catch(err => console.error("Failed to load GeoJSON data:", err));
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", populateBoroughPage);
