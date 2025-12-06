const SHEET_ID = "146tfBuTleE00V5hVp6tMgPyGmYxpOxj3hWi9I7x5KDM";

const CATEGORY_TABS = {
    "cars": "Cars",
    "guns": "Guns",
    "wraps": "Wraps",
    "gun-customisation": "Gun Customisation",
    "car-customisation": "Car Customisation"
};

async function loadCategoryFromSheets(category) {
    const tab = CATEGORY_TABS[category];
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(tab)}`;

    try {
        const res = await fetch(url);
        const text = await res.text();

        const json = JSON.parse(
            text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
        );

        const rows = json.table.rows;
        const headers = json.table.cols.map(c => c.label);

        const items = rows.map(r => {
            const obj = {};
            r.c.forEach((cell, i) => {
                obj[headers[i]] = cell?.v ?? "";
            });
            return obj;
        });

        window.LAST_LOADED_ITEMS = items;
        renderItems(items);

    } catch {
        document.getElementById("status-message").textContent = "Error loading spreadsheet data.";
    }
}

console.log("fetchSheets.js LOADED");
