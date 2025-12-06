/* LOAD EXTERNAL SCRIPT */
function loadScript(src) {
    const s = document.createElement("script");
    s.src = src;
    document.body.appendChild(s);
}

/* PASSWORD SYSTEM */
const PASSWORD_HASH = "ea6e8386385e62e415caa05fba660b9cbafc152ead3ecb35ba0c94e7afa4730e";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return [...new Uint8Array(hashBuffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

document.getElementById("login-button").addEventListener("click", async () => {
    const pwd = document.getElementById("password-input").value.trim();
    const hash = await sha256(pwd);

    if (hash === PASSWORD_HASH) {
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");

        loadScript("fetchSheets.js");
    } else {
        document.getElementById("login-error").textContent = "Incorrect password.";
    }
});

/* CATEGORIES */
const CATEGORY_MAP = {
    "cars":              { title: "Cars" },
    "guns":              { title: "Guns" },
    "wraps":             { title: "Wraps" },
    "gun-customisation": { title: "Gun Customisation" },
    "car-customisation": { title: "Car Customisation" }
};

document.querySelectorAll(".nav-button").forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        setActiveCategory(category);

        if (window.loadCategoryFromSheets) {
            loadCategoryFromSheets(category);
        }
    });
});

function setActiveCategory(category) {
    document.querySelectorAll(".nav-button")
        .forEach(btn => btn.classList.toggle("active", btn.dataset.category === category));

    document.getElementById("category-title").textContent =
        CATEGORY_MAP[category].title;
}

/* VALUE FORMATTING */
function formatValue(v) {
    if (!v) return "N/A";

    if (typeof v === "string" && /[kKmM,]/.test(v)) {
        return v;
    }

    let num = Number(v);
    if (!isNaN(num)) return num.toLocaleString();

    return v;
}

/* SEARCH SYSTEM */
let currentItems = [];

function applySearch() {
    const query = document.getElementById("search-input").value.toLowerCase();

    const filtered = currentItems.filter(item =>
        item.Name && item.Name.toLowerCase().includes(query)
    );

    renderItems(filtered);
}

document.getElementById("search-input").addEventListener("input", applySearch);

window.setCurrentItems = function(items) {
    currentItems = items;
    applySearch();
};

/* RENDER ITEM CARDS */
function renderItems(items) {
    const container = document.getElementById("items-container");
    container.innerHTML = "";

    items.forEach(item => {
        const rarity = (item.Rarity || "Unknown").toLowerCase().replace(/\s+/g, "-");

        const card = document.createElement("div");
        card.className = "item-card";

        card.innerHTML = `
            <h3 class="item-name">${item.Name}</h3>

            <div class="item-image-wrap">
                ${
                    item.ImageURL ?
                    `<img src="${item.ImageURL}" class="item-image" />` :
                    `<div class="item-image" style="opacity:0.3;">No Image</div>`
                }
            </div>

            <div class="rarity-badge rarity-${rarity}">${item.Rarity}</div>

            <p class="asset-value">Asset Value: ${formatValue(item.AssetValue)}</p>
            <p class="pawn-value">Pawn Value: ${formatValue(item.PawnValue)}</p>
        `;

        container.appendChild(card);
    });
}

console.log("SCRIPT LOADED");