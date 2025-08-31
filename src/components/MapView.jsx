import React, { useEffect, useRef, useState, useCallback } from "react";
import "ol/ol.css";
import { Map, View, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Cluster from "ol/source/Cluster";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { extend } from "ol/extent";
import {
  Style,
  Icon,
  Circle as CircleStyle,
  Fill,
  Stroke,
  Text,
} from "ol/style";
import { X, Layers, LocateFixed } from "lucide-react";

// ✅ fallback icons
import { defaultIcon, categoryIcons } from "../utils/icons";

const isRetina = window.devicePixelRatio > 1;

// ✅ basemaps
const basemaps = {
  Voyager: new XYZ({
    url: `https://{1-4}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}${
      isRetina ? "@2x" : ""
    }.png`,
    attributions:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    crossOrigin: "anonymous",
    maxZoom: 22, // allow deeper zoom
  }),
  Dark: new XYZ({
    url: `https://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}${
      isRetina ? "@2x" : ""
    }.png`,
    attributions:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    crossOrigin: "anonymous",
    maxZoom: 22,
  }),
  Satellite: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri",
    crossOrigin: "anonymous",
    maxZoom: 22,
  }),
};

const MapView = ({ locations = [], onLocate }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const tileLayerRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const clusterSourceRef = useRef(null);
  const clusterLayerRef = useRef(null);
  const userLayerRef = useRef(null);
  const popupRef = useRef(null);
  const popupOverlayRef = useRef(null);

  const [activeBasemap, setActiveBasemap] = useState("Voyager");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);

  // ✅ small icon scaling
  const getIconScale = () => {
    if (window.innerWidth < 480) return 0.06;
    if (window.innerWidth < 768) return 0.055;
    if (window.innerWidth < 1280) return 0.05;
    return 0.045;
  };

  // ✅ style function
  const styleFunction = useCallback((feature) => {
    const features = feature.get("features");
    const size = features.length;

    if (size > 1) {
      return new Style({
        image: new CircleStyle({
          radius: 18,
          fill: new Fill({ color: "#2563eb" }),
          stroke: new Stroke({ color: "#fff", width: 3 }),
        }),
        text: new Text({
          text: size.toString(),
          font: "bold 14px Poppins, sans-serif",
          fill: new Fill({ color: "#fff" }),
        }),
      });
    }

    const props = features[0].getProperties();
    // ✅ now we use the `loc.icon` passed from App.jsx
    const iconUrl = props.icon || defaultIcon;

    return new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: iconUrl,
        scale: getIconScale(),
        crossOrigin: "anonymous",
      }),
      text: new Text({
        text: props.name || "",
        font: "600 11px Poppins, sans-serif",
        offsetY: -25,
        fill: new Fill({ color: "#fff" }),
        stroke: new Stroke({ color: "#000", width: 3 }),
      }),
    });
  }, []);

  // ✅ init map
  useEffect(() => {
    if (!mapRef.current) return;

    vectorSourceRef.current = new VectorSource();
    clusterSourceRef.current = new Cluster({
      distance: 40,
      source: vectorSourceRef.current,
    });
    clusterLayerRef.current = new VectorLayer({
      source: clusterSourceRef.current,
      style: styleFunction,
      zIndex: 10,
    });
    userLayerRef.current = new VectorLayer({
      source: new VectorSource(),
      zIndex: 20,
    });
    tileLayerRef.current = new TileLayer({
      source: basemaps[activeBasemap],
      zIndex: 0,
    });

    popupRef.current = document.createElement("div");
    popupRef.current.className =
      "bg-white rounded-xl shadow-lg border border-gray-300 p-3 max-w-xs";

    popupOverlayRef.current = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      stopEvent: true,
      offset: [0, -20],
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [tileLayerRef.current, clusterLayerRef.current, userLayerRef.current],
      view: new View({ center: fromLonLat([77.209, 28.6139]), zoom: 5, maxZoom: 22 }),
      overlays: [popupOverlayRef.current],
      controls: [],
    });

    // ✅ click handler
    mapInstance.current.on("click", (evt) => {
      const feature = mapInstance.current.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (!feature) return;

      const features = feature.get("features");
      if (!features) return;

      if (features.length > 1) {
        const extent = features[0].getGeometry().getExtent().slice();
        features.forEach((f) => extend(extent, f.getGeometry().getExtent()));
        mapInstance.current
          .getView()
          .fit(extent, { duration: 700, padding: [50, 50, 50, 50] });
        return;
      }

      const first = features[0];
      const props = first.getProperties();
      const coordinates = first.getGeometry().getCoordinates();

      popupRef.current.innerHTML = `
        <div class="space-y-2">
          <h3 class="font-bold text-base">${props.name}</h3>
          <p class="text-xs italic text-gray-500">${props.category || ""}</p>
          ${
            props.description
              ? `<p class="text-sm text-gray-700">${props.description}</p>`
              : ""
          }
          ${
            props.image
              ? `<img class="w-40 h-24 object-cover rounded-lg shadow" src="${props.image}" alt="${props.name}" />`
              : ""
          }
        </div>
      `;

      popupOverlayRef.current.setPosition(coordinates);
      mapInstance.current
        .getView()
        .animate({ center: coordinates, zoom: 15, duration: 700 });
    });

    return () => {
      mapInstance.current.setTarget(null);
    };
  }, [styleFunction, activeBasemap]);

  // ✅ update basemap
  useEffect(() => {
    if (tileLayerRef.current) tileLayerRef.current.setSource(basemaps[activeBasemap]);
  }, [activeBasemap]);

  // ✅ load features
  useEffect(() => {
    if (!clusterSourceRef.current) return;

    vectorSourceRef.current.clear();
    const seen = new Set();
    const uniqueLocations = locations.filter((loc) => {
      const key = `${loc.lat},${loc.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const features = uniqueLocations.map((loc) => {
      const f = new Feature({
        geometry: new Point(fromLonLat([loc.lng, loc.lat])),
      });
      // ✅ make sure loc.icon is attached
      f.setProperties({ ...loc, type: "poi", icon: loc.icon || defaultIcon });
      return f;
    });

    vectorSourceRef.current.addFeatures(features);
    clusterSourceRef.current.setSource(vectorSourceRef.current);
    clusterLayerRef.current.setStyle(styleFunction);
  }, [locations, styleFunction]);

  // ✅ locate user
  const handleLocate = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
        const userSource = userLayerRef.current.getSource();
        userSource.clear();
        const userFeature = new Feature({ geometry: new Point(coords) });
        userFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: "#2563eb" }),
              stroke: new Stroke({ color: "#fff", width: 3 }),
            }),
          })
        );
        userSource.addFeature(userFeature);
        mapInstance.current
          .getView()
          .animate({ center: coords, zoom: 15, duration: 700 });
        onLocate?.({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Unable to retrieve location.")
    );
  };

  // ✅ select location from sidebar
  const handleSelectLocation = (loc) => {
    const coords = fromLonLat([loc.lng, loc.lat]);
    popupRef.current.innerHTML = `
      <div class="space-y-2">
        <h3 class="font-bold text-base">${loc.name}</h3>
        <p class="text-xs italic text-gray-500">${loc.category || ""}</p>
        ${loc.description ? `<p class="text-sm text-gray-700">${loc.description}</p>` : ""}
        ${loc.image ? `<img class="w-40 h-24 object-cover rounded-lg shadow" src="${loc.image}" alt="${loc.name}" />` : ""}
      </div>
    `;
    popupOverlayRef.current.setPosition(coords);
    mapInstance.current
      .getView()
      .animate({ center: coords, zoom: 15, duration: 700 });
  };

  // ✅ sidebar
  const Sidebar = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
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
          handleSelectLocation({
            lng: coordinates[0],
            lat: coordinates[1],
            name: `${name || query}, ${country || ""}`,
          });
          onClose();
        } else alert("No results found");
      } catch (err) {
        console.error(err);
        alert("Search failed");
      }
    };

    const filteredLocations =
      categoryFilter === "All"
        ? locations
        : locations.filter((loc) => loc.category === categoryFilter);

    return (
      <div
        className={`fixed md:static top-0 left-0 h-full w-72 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto transform transition-transform duration-300 z-[150] ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-lg font-bold">📍 Points of Interest</h2>
          <button onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>
        <h2 className="hidden md:block text-lg font-bold mb-4">
          📍 Points of Interest
        </h2>
        <div className="flex mb-4">
          <input
            id="searchInput"
            name="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by place..."
            autoComplete="off"
            className="flex-grow min-w-0 border border-gray-300 rounded-l px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
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
        {filteredLocations.map((loc, idx) => {
          const categoryKey = (loc.category || "").toLowerCase().trim();
          const icon = categoryIcons[categoryKey] || defaultIcon;
          return (
            <div
              key={idx}
              onClick={() => {
                handleSelectLocation(loc);
                onClose();
              }}
              className="p-3 mb-2 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-100 transition flex items-center gap-3"
            >
              <img
                src={icon}
                alt={loc.category}
                className="w-6 h-6 object-contain"
              />
              <div>
                <div className="font-semibold">{loc.name}</div>
                <div className="text-sm text-gray-600">{loc.category}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex relative h-screen w-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-[200] bg-blue-600 text-white p-2 rounded-lg shadow"
        >
          ☰
        </button>
      )}

      {/* ✅ basemap menu */}
      <div className="absolute top-4 right-4 z-[200] flex flex-col md:flex-row gap-2">
        <button
          onClick={() => setShowBasemapMenu(!showBasemapMenu)}
          className="md:hidden bg-white p-2 rounded-lg shadow"
        >
          <Layers size={20} />
        </button>

        {/* mobile dropdown */}
        <div
          className={`absolute top-12 right-0 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg transition-all duration-300 md:hidden ${
            showBasemapMenu
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          {Object.keys(basemaps).map((name) => (
            <button
              key={name}
              onClick={() => {
                setActiveBasemap(name);
                setShowBasemapMenu(false);
              }}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                activeBasemap === name
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* desktop inline */}
        <div className="hidden md:flex gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg">
          {Object.keys(basemaps).map((name) => (
            <button
              key={name}
              onClick={() => setActiveBasemap(name)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                activeBasemap === name
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div ref={mapRef} className="flex-1 w-full h-full relative z-0" />

      {/* ✅ Locate button */}
      <button
        onClick={handleLocate}
        className="absolute bottom-6 right-4 bg-blue-600 text-white p-3 rounded-xl shadow hover:bg-blue-700 z-[200] flex items-center gap-2"
      >
        <LocateFixed size={20} />{" "}
        <span className="hidden md:inline">Locate Me</span>
      </button>
    </div>
  );
};

export default MapView;
