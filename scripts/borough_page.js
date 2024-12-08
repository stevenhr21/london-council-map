function getBoroughFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let boroughName = urlParams.get('borough');

    if (!boroughName) {
        // Fallback: Extract borough name from the file path
        boroughName = window.location.pathname
            .split('/')
            .pop()
            .replace('.html', '')
            .replace(/-/g, ' '); // Convert dashes to spaces
    }

    return boroughName.toLowerCase();
}

function populateBoroughPage() {
    const boroughName = getBoroughFromURL();

    if (!boroughName) {
        document.getElementById('borough-name').textContent = "Borough Not Found";
        return;
    }

    fetch('../data/london_boroughs.geojson')
        .then(response => response.json())
        .then(data => {
            const boroughData = data.features.find(feature =>
                feature.properties.lad22nm.toLowerCase() === boroughName
            );

            if (!boroughData) {
                document.getElementById('borough-name').textContent = "Borough Not Found";
                return;
            }

            const { lad22nm, Leader, Population, Budget, Website } = boroughData.properties;

            // Update the page content dynamically
            document.getElementById('borough-name').textContent = lad22nm || "Unknown Borough";
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
        .catch(err => {
            console.error("Failed to load GeoJSON data:", err);
            document.getElementById('borough-name').textContent = "Data Load Error";
        });
}

document.addEventListener("DOMContentLoaded", populateBoroughPage);
