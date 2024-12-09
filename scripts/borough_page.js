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

            // Fetch councillor data
            fetchCouncillors(boroughName.replace(/\s+/g, '-').toLowerCase());
        })
        .catch(err => {
            console.error("Failed to load GeoJSON data:", err);
            document.getElementById('borough-name').textContent = "Data Load Error";
        });
}

function fetchCouncillors(boroughName) {
    // Map borough names to their councillor page URLs
    const boroughURLs = {
        "barking-and-dagenham": "https://example.com/councillors-barking-and-dagenham",
        // Add URLs for other boroughs
    };

    const url = boroughURLs[boroughName];

    if (!url) {
        console.error("Councillor URL not found for this borough");
        handleMissingCouncillorData();
        return;
    }

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Select rows in the councillor table
            const rows = doc.querySelectorAll('#mgTable2 tbody tr');

            const councillorList = document.getElementById('councillor-list');

            if (!rows || rows.length === 0) {
                handleMissingCouncillorData();
                return;
            }

            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(1) a')?.textContent.trim() || "Unknown";
                const role = row.querySelector('td:nth-child(2)')?.textContent.trim() || "Unknown";
                const ward = row.querySelector('td:nth-child(3)')?.textContent.trim() || "Unknown";

                // Create a new table row
                const tr = document.createElement('tr');

                // Add color coding based on political party (assume party name is in 'role')
                let partyColor;
                if (role.includes("Labour")) partyColor = "#FF0000"; // Red for Labour
                else if (role.includes("Conservative")) partyColor = "#0000FF"; // Blue for Conservative
                else if (role.includes("Liberal Democrat")) partyColor = "#FDBB30"; // Yellow for Lib Dems
                else partyColor = "#FFFFFF"; // Default: White

                tr.style.backgroundColor = partyColor;

                // Add cells to the row
                tr.innerHTML = `
                    <td>${name}</td>
                    <td>${role}</td>
                    <td>${ward}</td>
                `;

                // Append the row to the table body
                councillorList.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error fetching councillor data:", err);
            handleMissingCouncillorData();
        });
}

function handleMissingCouncillorData() {
    const councillorList = document.getElementById('councillor-list');
    councillorList.innerHTML = `<tr><td colspan="3">No councillor data available for this borough.</td></tr>`;
}

// Dropdown menu toggle functionality
function setupMenu() {
    const menuButton = document.querySelector('.menu-button');
    const dropdown = document.querySelector('.menu-dropdown');

    if (!menuButton || !dropdown) {
        console.error("Menu elements not found.");
        return;
    }

    menuButton.addEventListener('click', () => {
        const isDropdownVisible = dropdown.style.display === 'block';
        dropdown.style.display = isDropdownVisible ? 'none' : 'block';
    });

    // Close the menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!menuButton.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateBoroughPage();
    setupMenu();
});
