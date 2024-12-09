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
        // Fetch data from the ModernGov endpoint
        const response = await fetch(endpoint);
        const xmlText = await response.text();

        // Parse the XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // Extract councillor data from the XML
        const councillors = xmlDoc.getElementsByTagName("Councillor");
        const councillorList = document.getElementById("councillor-list");
        councillorList.innerHTML = ""; // Clear any existing rows

        if (!councillors || councillors.length === 0) {
            handleMissingCouncillorData();
            return;
        }

        // Loop through each councillor and populate the table
        for (let i = 0; i < councillors.length; i++) {
            const councillor = councillors[i];
            const name =
                councillor.getElementsByTagName("Name")[0]?.textContent ||
                "Unknown";
            const ward =
                councillor.getElementsByTagName("Ward")[0]?.textContent ||
                "Unknown";
            const role =
                councillor.getElementsByTagName("Role")[0]?.textContent ||
                "Councillor";
            const party =
                councillor.getElementsByTagName("Party")[0]?.textContent ||
                "Unknown";

            // Create a new table row
            const row = document.createElement("tr");

            // Add color coding based on political party
            let partyColor;
            if (party.includes("Labour")) partyColor = "#FFCCCC"; // Light red
            else if (party.includes("Conservative")) partyColor = "#CCCCFF"; // Light blue
            else if (party.includes("Liberal Democrat"))
                partyColor = "#FFFFCC"; // Light yellow
            else partyColor = "#FFFFFF"; // Default: White

            row.style.backgroundColor = partyColor;

            // Populate the row
            row.innerHTML = `
                <td>${name}</td>
                <td>${role}</td>
                <td>${ward}</td>
            `;
            councillorList.appendChild(row);
        }
    } catch (err) {
        console.error("Error fetching councillor data:", err);
        handleMissingCouncillorData();
    }
}

function handleMissingCouncillorData() {
    const councillorList = document.getElementById("councillor-list");
    councillorList.innerHTML = `
        <tr>
            <td colspan="3" style="text-align: center; color: red;">
                No councillor data available for this borough.
            </td>
        </tr>`;
}

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
