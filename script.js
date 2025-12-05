/* ------------------------------
    LOAD EXTERNAL SCRIPT
------------------------------ */
function loadScript(src) {
    const s = document.createElement("script");
    s.src = src;
    document.body.appendChild(s);
}

/* ------------------------------
    PASSWORD SYSTEM
------------------------------ */
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
        // hide login, show app
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");

        // Load spreadsheet system ONLY after password!
        loadScript("fetchSheets.js");
    } else {
        document.getElementById("login-error").textContent = "Incorrect password.";
    }
});

/* ------------------------------
    CATEGORIES (NO JSON ANYMORE)
------------------------------ */
const CATEGORY_MAP = {
    "cars": { title: "Cars", sheet: "Cars" },
    "guns": { title: "Guns", sheet: "Guns" },
    "wraps": { title: "Wraps", sheet: "Wraps" },
    "gun-customisation": { title: "Gun Customisation", sheet: "Gun Customisation" },
    "car-customisation": { title: "Car Customisation", sheet: "Car Customisation" }
};

/* ------------------------------
    CATEGORY BUTTONS
------------------------------ */
document.querySelectorAll(".nav-button").forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        setActiveCategory(category);

        // Call spreadsheet loader (defined inside fetchSheets.js)
        if (window.loadCategoryFromSheets) {
            loadCategoryFromSheets(category);
        }
    });
});

function setActiveCategory(category) {
    document.querySelectorAll(".nav-button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === category);
    });

    document.getElementById("category-title").textContent =
        CATEGORY_MAP[category].title;
}

/* ------------------------------
    RENDER ITEM CARDS
------------------------------ */
function renderItems(items) {
    const container = document.getElementById("items-container");
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";

        card.innerHTML = `
            <h3 class="item-name">${item.Name}</h3>

            <div class="item-image-wrap">
                <img src="${item["Image URL"]}" class="item-image" />
            </div>

            <div class="rarity-badge rarity-${item.Rarity.toLowerCase()}">
                ${item.Rarity}
            </div>

            <p class="asset-value">Asset Value: ${item.AssetValue}</p>
            <p class="pawn-value">Pawn Value: ${item.PawnValue}</p>
        `;

        container.appendChild(card);
    });
}

console.log("SCRIPT LOADED");
