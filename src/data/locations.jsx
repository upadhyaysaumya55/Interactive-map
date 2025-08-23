/* global L */   // Tell ESLint that L is a global (from Leaflet CDN)

// --- Locations data ---
const locations = [
  {
    id: 1,
    name: "Taj Mahal",
    category: "Monument",
    lat: 27.1751,
    lng: 78.0421,
    description: "An ivory-white marble mausoleum in Agra, India.",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg"
  },
  {
    id: 2,
    name: "India Gate",
    category: "Monument",
    lat: 28.6129,
    lng: 77.2295,
    description: "War memorial located in New Delhi.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/India_Gate_in_New_Delhi_03-2016_img3.jpg"
  },
  {
    id: 3,
    name: "Gateway of India",
    category: "Monument",
    lat: 18.922,
    lng: 72.8347,
    description: "Historic arch-monument built in Mumbai.",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Mumbai_03-2016_img3_Gateway_of_India.jpg"
  },
  {
    id: 4,
    name: "Qutub Minar",
    category: "Monument",
    lat: 28.5245,
    lng: 77.1855,
    description: "Tallest brick minaret in the world, Delhi.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Qutub_Minar_in_New_Delhi_2016_img3.jpg"
  },
  {
    id: 5,
    name: "Red Fort",
    category: "Monument",
    lat: 28.6562,
    lng: 77.241,
    description: "Historic fort in Delhi, served as the Mughal residence.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/76/Red_Fort_in_Delhi_03-2016_img3.jpg"
  }
];

// --- Init map ---
const map = L.map("map").setView([28.6139, 77.209], 5);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// --- Add markers ---
const markers = [];
locations.forEach(loc => {
  const marker = L.marker([loc.lat, loc.lng]).addTo(map);

  marker.bindPopup(`
    <div class="p-2 max-w-xs">
      <h3 class="font-bold text-lg">${loc.name}</h3>
      <p class="text-xs italic text-gray-500 mb-1">${loc.category}</p>
      <p class="text-sm">${loc.description}</p>
      <img class="w-40 mt-2 rounded shadow" src="${loc.image}" alt="${loc.name}">
    </div>
  `);

  // Bounce on marker click
  marker.on("click", () => {
    markerBounce(marker);
  });

  markers.push({ ...loc, marker });
});

// --- Bounce animation helper ---
function markerBounce(marker) {
  let i = 0;
  const interval = setInterval(() => {
    const offset = (i % 2 === 0 ? -15 : 15); // bounce up/down
    marker._icon.style.transform = `translateY(${offset}px)`;
    i++;
    if (i > 4) {
      clearInterval(interval);
      marker._icon.style.transform = "translateY(0)";
    }
  }, 150);
}

// --- Populate sidebar ---
const list = document.getElementById("location-list");
function renderList(filteredLocations = locations) {
  list.innerHTML = "";
  filteredLocations.forEach(loc => {
    const li = document.createElement("li");
    li.className = "p-2 border-b cursor-pointer hover:bg-gray-100";
    li.innerHTML = `<strong>${loc.name}</strong><br><small>${loc.category}</small>`;
    li.onclick = () => {
      map.flyTo([loc.lat, loc.lng], 12, { animate: true, duration: 1.5 });
      loc.marker.openPopup();
      markerBounce(loc.marker);
    };
    list.appendChild(li);
  });
}
renderList();

// --- Search function ---
function handleSearch() {
  const query = document.getElementById("search").value.toLowerCase();
  if (!query) return;

  const match = markers.find(loc =>
    loc.name.toLowerCase().includes(query) ||
    loc.category.toLowerCase().includes(query)
  );

  if (match) {
    map.flyTo([match.lat, match.lng], 12, { animate: true, duration: 1.5 });
    match.marker.openPopup();
    markerBounce(match.marker);
  } else {
    alert("No results found");
  }
}

// --- Category filter ---
function handleFilter() {
  const selected = document.getElementById("categoryFilter").value;
  if (selected === "All") {
    markers.forEach(m => map.addLayer(m.marker));
    renderList(locations);
  } else {
    const filtered = markers.filter(m => m.category === selected);
    markers.forEach(m => map.removeLayer(m.marker));
    filtered.forEach(m => map.addLayer(m.marker));
    renderList(filtered);
  }
}

// --- Mobile sidebar toggle ---
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("hidden");
}

// Expose to HTML (so onclick works)
window.handleSearch = handleSearch;
window.handleFilter = handleFilter;
window.toggleSidebar = toggleSidebar;
