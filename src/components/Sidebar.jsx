import React, { useState } from "react";

const Sidebar = ({ locations, onSelect, onSearch }) => {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Extract unique categories from the locations list
  const categories = ["All", ...new Set(locations.map((loc) => loc.category))];

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=en`
      );
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const { coordinates } = data.features[0].geometry;
        const { name, country } = data.features[0].properties;

        onSearch({
          lon: coordinates[0],
          lat: coordinates[1],
          name: `${name || query}, ${country || ""}`,
        });
      } else {
        alert("No results found");
      }
    } catch (err) {
      console.error(err);
      alert("Search failed");
    }
  };

  // Filtered locations based on category
  const filteredLocations =
    categoryFilter === "All"
      ? locations
      : locations.filter((loc) => loc.category === categoryFilter);

  return (
    <div className="w-72 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">📍 Points of Interest</h2>

      {/* Search Box */}
      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by place..."
          className="flex-grow min-w-0 border border-gray-300 rounded-l px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              categoryFilter === cat
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List of POIs */}
      {filteredLocations.map((loc) => (
        <div
          key={loc.id}
          onClick={() => onSelect(loc)}
          className="p-3 mb-2 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
        >
          <div className="font-semibold">{loc.name}</div>
          <div className="text-sm text-gray-600">{loc.category}</div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
