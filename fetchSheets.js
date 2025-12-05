const SHEET_ID = "146tfBuTleE00V5hVp6tMgPyGmYxpOxj3hWi9I7x5KDM";

const SHEET_MAP = {
    "cars": "Cars",
    "guns": "Guns",
    "wraps": "Wraps",
    "Gun Customisation": "Gun Customisation",
    "car-customisation": "Car Customisation"
};

function normHeader(h) {
    return (h || "").toString().toLowerCase().replace(/\s+/g, "");
}

async function loadSheet(sheetName) {
    const url =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&tqx=out:json`;

    try {
        const res = await fetch(url);
        const text = await res.text();

        const jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        const data = JSON.parse(jsonText);

        const headers = data.table.cols.map(col => col.label || "");
        const rows = data.table.rows.map(row =>
            row.c.map(cell => (cell ? cell.v : ""))
        );

        const nameIdx  = headers.findIndex(h => normHeader(h) === "name");
        const imgIdx   = headers.findIndex(h => ["imageurl", "image"].includes(normHeader(h)));
        const rarIdx   = headers.findIndex(h => normHeader(h) === "rarity");
        const assetIdx = headers.findIndex(h => ["assetvalue", "asset"].includes(normHeader(h)));
        const pawnIdx  = headers.findIndex(h => ["pawnvalue", "pawn"].includes(normHeader(h)));

        const items = rows
            .filter(row => row.some(v => v !== ""))
            .map(row => ({
                Name:       nameIdx  >= 0 ? row[nameIdx]  : "",
                ImageURL:   imgIdx   >= 0 ? row[imgIdx]   : "",
                Rarity:     rarIdx   >= 0 ? row[rarIdx]   : "",
                AssetValue: assetIdx >= 0 ? row[assetIdx] : "",
                PawnValue:  pawnIdx  >= 0 ? row[pawnIdx]  : ""
            }));

        if (window.setCurrentItems) {
            window.setCurrentItems(items);
        }

        renderItems(items);
        return items;

    } catch (err) {
        console.error("Error loading sheet:", err);
        return [];
    }
}

window.loadCategoryFromSheets = async function(category) {
    const sheetName = category.replace("-", " ");
    document.getElementById("status-message").textContent = "Loading...";
    await loadSheet(sheetName);
    document.getElementById("status-message").textContent = "";
};

window.loadCategoryFromSheets("cars");
