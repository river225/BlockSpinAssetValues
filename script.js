
const PASSWORD_HASH = "9be7488a40ee038eac599325d348f25ffe6f0d0de31b50680c9ef8b11f0a1a98";  

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

    setActiveCategory("cars");
    loadCategory("cars");
  } else {
    document.getElementById("login-error").textContent = "Incorrect password.";
  }
});



const CATEGORY_MAP = {
  "cars": {
    title: "Cars",
    file: "Cars.json"
  },
  "guns": {
    title: "Guns",
    file: "Guns.json"
  },
  "wraps": {
    title: "Wraps",
    file: "Wraps.json"
  },
  "gun-customisation": {
    title: "Gun Customisation",
    file: "Gun Customisation.json"
  },
  "car-customisation": {
    title: "Car Customisation",
    file: "Car Customisation.json"
  }
};



document.querySelectorAll(".nav-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    setActiveCategory(category);
    loadCategory(category);
  });
});

function setActiveCategory(category) {
  document.querySelectorAll(".nav-button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });

  document.getElementById("category-title").textContent =
    CATEGORY_MAP[category].title;
}




async function loadCategory(category) {
  const fileName = CATEGORY_MAP[category].file;

  try {
    const res = await fetch("blockspin-asset-values/" + fileName);
    const items = await res.json();

    renderItems(items);
    document.getElementById("status-message").textContent = "";
  } catch (err) {
    document.getElementById("status-message").textContent =
      "Error loading items.";
  }
}

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

      <p class="asset-value">Asset Value: $${Number(item.AssetValue).toLocaleString()}</p>
      <p class="pawn-value">Pawn Value: $${Number(item.PawnValue).toLocaleString()}</p>
    `;

    container.appendChild(card);
  });
}

console.log("SCRIPT LOADED");
