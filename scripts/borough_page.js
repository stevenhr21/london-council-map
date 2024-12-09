async function getBoroughFromURL() {
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

async function populateBoroughPage() {
    const boroughName = await getBoroughFromURL();

    if (!boroughName) {
        document.getElementById('borough-name').textContent = "Borough Not Found";
        return;
    }

    fetch('../data/london_boroughs.geojson')
        .then((response) => response.json())
        .then((data) => {
            const boroughData = data.features.find(
                (feature) =>
                    feature.properties.lad22nm.toLowerCase() === boroughName
            );

            if (!boroughData) {
                document.getElementById('borough-name').textContent =
                    "Borough Not Found";
                return;
            }

            const { lad22nm, Leader, Population, Budget, Website } =
                boroughData.properties;

            // Update the page content dynamically
            document.getElementById("borough-name").textContent =
                lad22nm || "Unknown Borough";
            document.getElementById("leader").textContent =
                Leader || "Information not available";
            document.getElementById("population").textContent = Population
                ? Population.toLocaleString()
                : "Data not available";
            document.getElementById("budget").textContent = Budget
                ? `£${Budget.toLocaleString()}`
                : "Data not available";

            const websiteLink = document.getElementById("website");
            websiteLink.textContent = Website
                ? "Visit Council Website"
                : "Website not available";
            websiteLink.href = Website || "#";

            // Fetch councillor data dynamically
            fetchCouncillors();
        })
        .catch((err) => {
            console.error("Failed to load GeoJSON data:", err);
            document.getElementById("borough-name").textContent =
                "Data Load Error";
        });
}

async function fetchCouncillors() {
    const endpoint =
        "https://lbbd.moderngov.co.uk/mgWebService.asmx/GetCouncillorsByWard";

    try {
        // Fetch data from the endpoint
        const response = await fetch(endpoint, { mode: 'cors' });
        const xmlText = await response.text();

        // Log raw XML response for debugging
        console.log("Raw XML Response:", xmlText);

        // Parse the XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // Log parsed XML for inspection
        console.log("Parsed XML Document:", xmlDoc);

        // Extract all ward elements
        const wards = xmlDoc.getElementsByTagName("ward");
        console.log("Wards Found:", wards);

        // Reference to the councillor table in the HTML
        const councillorList = document.getElementById("councillor-list");
        councillorList.innerHTML = ""; // Clear any existing rows

        if (!wards || wards.length === 0) {
            console.warn("No wards found in XML.");
            handleMissingCouncillorData();
            return;
        }

        // Loop through each ward and councillors
        for (let i = 0; i < wards.length; i++) {
            const ward = wards[i];
            const wardTitle =
                ward.getElementsByTagName("wardtitle")[0]?.textContent.trim() || "Unknown Ward";

            console.log(`Processing Ward: ${wardTitle}`);

            const councillors = ward.getElementsByTagName("councillor");

            for (let j = 0; j < councillors.length; j++) {
                const councillor = councillors[j];
                const name =
                    councillor.getElementsByTagName("fullusername")[0]?.textContent.trim() ||
                    "Unknown";
                const party =
                    councillor.getElementsByTagName("politicalpartytitle")[0]?.textContent.trim() ||
                    "Unknown";
                const role =
                    councillor.getElementsByTagName("keyposts")[0]?.textContent.trim() ||
                    "Councillor";

                // Log councillor details for debugging
                console.log("Councillor Details:", { name, party, role, wardTitle });

                // Create a new table row
                const row = document.createElement("tr");

                // Add color coding based on political party
                let partyColor;
                if (party.includes("Labour")) partyColor = "#FFCCCC";
                else if (party.includes("Conservative")) partyColor = "#CCCCFF";
                else if (party.includes("Liberal Democrat")) partyColor = "#FFFFCC";
                else partyColor = "#FFFFFF";

                row.style.backgroundColor = partyColor;

                // Add cells to the row
                row.innerHTML = `
                    <td>${name}</td>
                    <td>${role}</td>
                    <td>${wardTitle}</td>
                `;

                // Append the row to the table
                councillorList.appendChild(row);
            }
        }
    } catch (err) {
        console.error("Error fetching councillor data:", err);
        handleMissingCouncillorData();
    }
}

function handleMissingCouncillorData() {
    const councillorList = document.getElementById("councillor-list");
    councillorList.innerHTML = `<tr><td colspan="3">No councillor data available for this borough.</td></tr>`;
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", fetchCouncillors);

// Dropdown menu toggle functionality
function setupMenu() {
    const menuButton = document.querySelector(".menu-button");
    const dropdown = document.querySelector(".menu-dropdown");

    if (!menuButton || !dropdown) {
        console.error("Menu elements not found.");
        return;
    }

    menuButton.addEventListener("click", () => {
        const isDropdownVisible = dropdown.style.display === "block";
        dropdown.style.display = isDropdownVisible ? "none" : "block";
    });

    // Close the menu when clicking outside
    document.addEventListener("click", (event) => {
        if (
            !menuButton.contains(event.target) &&
            !dropdown.contains(event.target)
        ) {
            dropdown.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateBoroughPage();
    setupMenu();
});
