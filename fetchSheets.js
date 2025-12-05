/* ------------------------------------------------
      GOOGLE SHEETS LIVE DATA LOADER
   ------------------------------------------------ */

//
// 1) PUT YOUR SPREADSHEET ID HERE
//    Example ID from:
//    https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
//
const SHEET_ID = "146tfBuTleE00V5hVp6tMgPyGmYxpOxj3hWi9I7x5KDM";

//
// 2) MAP YOUR WEBSITE CATEGORIES TO SHEET NAMES
//
const SHEET_MAP = {
    "cars": "Cars",
    "guns": "Guns",
    "wraps": "Wraps",
    "gun-customisation": "Gun Customisation",
    "car-customisation": "Car Customisation"
};


//
// 3) Load a single Google Sheet "tab" and convert it into clean JSON
//
async function loadSheet(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&tqx=out:json`;

    try {
        const res = await fetch(url);
        const text = await res.text();

        // Convert Google Visualization JSON into real JSON
        const jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        const data = JSON.parse(jsonText);

        const rows = data.table.rows.map(row =>
            row.c.map(cell => (cell ? cell.v : ""))
        );

        const headers = data.table.cols.map(col => col.label);

        // Convert rows → objects
        const items = rows.map(row => {
            let obj = {};
            row.forEach((val, index) => {
                obj[headers[index]] = val;
            });
            return obj;
        });

        return items;

    } catch (err) {
        console.error("Error loading sheet:", sheetName, err);
        return [];
    }
}


//
// 4) Load category from Google Sheets when a nav button is clicked
//
window.loadCategoryFromSheets = async function (category) {
    const sheetName = SHEET_MAP[category];
    if (!sheetName) return;

    document.getElementById("status-message").textContent = "Loading...";

    const items = await loadSheet(sheetName);

    document.getElementById("status-message").textContent = "";
    renderItems(items);
};


//
// 5) Automatically load "Cars" as soon as the sheet system loads
//
window.onload = () => {
    // Only runs AFTER password, because fetchSheets.js loads after login
    if (window.loadCategoryFromSheets) {
        window.loadCategoryFromSheets("cars");
    }
};
