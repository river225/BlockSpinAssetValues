/* ------------------------------------------------
      GOOGLE SHEETS LIVE DATA LOADER
   ------------------------------------------------ */

// 1) Your spreadsheet ID
const SHEET_ID = "146tfBuTleE00V5hVp6tMgPyGmYxpOxj3hWi9I7x5KDM";

// 2) Map website categories -> sheet tab names
const SHEET_MAP = {
    "cars": "Cars",
    "guns": "Guns",
    "wraps": "Wraps",
    "gun-customisation": "Gun Customisation",
    "car-customisation": "Car Customisation"
};

// Helper to normalise header text (for safety)
function normHeader(h) {
    return (h || "").toString().toLowerCase().replace(/\s+/g, "");
}

// 3) Load a single Google Sheets tab and convert it into clean item objects
async function loadSheet(sheetName) {
    const url =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&tqx=out:json`;

    try {
        const res = await fetch(url);
        const text = await res.text();

        // Strip Google Visualization wrapper to get pure JSON
        const jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        const data = JSON.parse(jsonText);

        const headers = data.table.cols.map(col => col.label || "");
        const rows = data.table.rows.map(row =>
            row.c.map(cell => (cell ? cell.v : ""))
        );

        // Find column indices (robust to minor header changes)
        const nameIdx  = headers.findIndex(h => normHeader(h) === "name");
        const imgIdx   = headers.findIndex(h => ["imageurl", "image"].includes(normHeader(h)));
        const rarIdx   = headers.findIndex(h => normHeader(h) === "rarity");
        const assetIdx = headers.findIndex(h => ["assetvalue", "asset"].includes(normHeader(h)));
        const pawnIdx  = headers.findIndex(h => ["pawnvalue", "pawn"].includes(normHeader(h)));

        const items = rows
            // skip fully empty rows
            .filter(row => row.some(v => v !== ""))
            .map(row => ({
                Name:      nameIdx  >= 0 ? row[nameIdx]  : "",
                ImageURL:  imgIdx   >= 0 ? row[imgIdx]   : "",
                Rarity:    rarIdx   >= 0 ? row[rarIdx]   || "Unknown" : "Unknown",
                AssetValue:assetIdx >= 0 ? row[assetIdx] : "",
                PawnValue: pawnIdx  >= 0 ? row[pawnIdx]  : ""
            }));

        console.log(`Loaded ${sheetName}:`, items);
        return items;

    } catch (err) {
        console.error("Error loading sheet:", sheetName, err);
        return [];
    }
}

// 4) Called from script.js when a category is selected
window.loadCategoryFromSheets = async function (category) {
    const sheetName = SHEET_MAP[category];
    if (!sheetName) return;

    const statusEl = document.getElementById("status-message");
    if (statusEl) statusEl.textContent = "Loading...";

    const items = await loadSheet(sheetName);

    if (statusEl) {
        statusEl.textContent = items.length ? "" : "No items in this category yet.";
    }

    // Uses renderItems defined in script.js
    renderItems(items);
};

// 5) Auto-load Cars as soon as this script is injected (after login)
if (typeof window !== "undefined") {
    window.loadCategoryFromSheets("cars");
}
