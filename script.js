function loadScript(src) {
    const s = document.createElement("script");
    s.src = src + "?v=" + Date.now();
    document.body.appendChild(s);
}

const PASSWORD_HASH = "ea6e8386385e62e415caa05fba660b9cbafc152ead3ecb35ba0c94e7afa4730e";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2,"0")).join("");
}

document.getElementById("login-button").addEventListener("click", async () => {
    const pwd = document.getElementById("password-input").value.trim();
    const hash = await sha256(pwd);

    if (hash === PASSWORD_HASH) {
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
        loadScript("fetchSheets.js");
        setTimeout(() => {
            setActiveCategory("cars");
            loadCategoryFromSheets("cars");
        }, 300);
    } else {
        document.getElementById("login-error").textContent = "Incorrect password.";
    }
});

const CATEGORY_MAP = {
    "cars": "Cars",
    "guns": "Guns",
    "wraps": "Wraps",
    "gun-customisation": "Gun Customisation",
    "car-customisation": "Car Customisation"
};

document.querySelectorAll(".nav-button").forEach(btn => {
    btn.addEventListener("click", () => {
        const cat = btn.dataset.category;
        setActiveCategory(cat);
        loadCategoryFromSheets(cat);
    });
});

function setActiveCategory(category) {
    document.querySelectorAll(".nav-button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === category);
    });
    document.getElementById("category-title").textContent = CATEGORY_MAP[category];
}

function renderItems(items) {
    const q = document.getElementById("search-input").value.toLowerCase();
    const container = document.getElementById("items-container");
    container.innerHTML = "";

    items.filter(item => item.Name.toLowerCase().includes(q)).forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <h3 class="item-name">${item.Name}</h3>
            <div class="item-image-wrap">
                <img src="${item["Image URL"]}" class="item-image">
            </div>
            <div class="rarity-badge rarity-${item.Rarity.toLowerCase()}">${item.Rarity}</div>
            <p class="asset-value">Asset Value: ${item.AssetValue}</p>
            <p class="pawn-value">Pawn Value: ${item.PawnValue}</p>
        `;
        container.appendChild(card);
    });
}

document.getElementById("search-input").addEventListener("input", () => {
    if (window.LAST_LOADED_ITEMS) renderItems(window.LAST_LOADED_ITEMS);
});

const mobileToggle = document.getElementById("mobile-menu-toggle");
const sidebar = document.querySelector(".sidebar");

if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

console.log("SCRIPT LOADED");
