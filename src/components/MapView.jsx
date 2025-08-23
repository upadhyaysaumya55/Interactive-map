import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Cluster from "ol/source/Cluster";
import { Feature } from "ol";
import { Point, Circle as CircleGeom } from "ol/geom";
import { fromLonLat } from "ol/proj";
import {
  Style,
  Icon,
  Circle as CircleStyle,
  Fill,
  Stroke,
  Text,
} from "ol/style";

// Icons by category
const ICONS = {
  restaurant: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  park: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  hospital: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
  default: "https://openlayers.org/en/latest/examples/data/icon.png",
};

// ✅ Basemaps (Carto = English labels + clean styles, Esri satellite)
const basemaps = {
  Voyager: new XYZ({
    url: "https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attributions:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
    crossOrigin: "anonymous",
  }),
  Satellite: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri &mdash; Source: Esri, Maxar",
    maxZoom: 20,
  }),
};

const MapView = ({ locations = [], onLocate, searchResult }) => {
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const clusterSourceRef = useRef(
    new Cluster({
      distance: 40,
      source: vectorSourceRef.current,
    })
  );

  const userLayerRef = useRef(null);
  const overlayRef = useRef(null);
  const popupRef = useRef(null);
  const mapInstance = useRef(null);

  const [activeBasemap, setActiveBasemap] = useState("Voyager");

  // Style function for POIs & clusters
  const styleFunction = (feature) => {
    const size = feature.get("features")?.length || 1;

    if (size > 1) {
      return new Style({
        image: new CircleStyle({
          radius: 15,
          fill: new Fill({ color: "#2563eb" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
        text: new Text({
          text: size.toString(),
          font: "bold 14px Poppins, sans-serif",
          fill: new Fill({ color: "#fff" }),
        }),
      });
    }

    const props = feature.get("features")[0].getProperties();
    const icon = ICONS[props.category?.toLowerCase()] || ICONS.default;

    return new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: icon,
        scale: 0.07,
        crossOrigin: "anonymous",
      }),
      text: new Text({
        text: props.name || "",
        font: "bold 12px Poppins, sans-serif",
        offsetY: -25,
        fill: new Fill({ color: "#fff" }),
        stroke: new Stroke({ color: "#000", width: 3 }),
      }),
    });
  };

  // Init map
  useEffect(() => {
    if (!mapRef.current) return;

    const overlay = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      stopEvent: true,
      offset: [0, -20],
    });
    overlayRef.current = overlay;

    const clusterLayer = new VectorLayer({
      source: clusterSourceRef.current,
      style: styleFunction,
      zIndex: 10,
    });

    const userLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 20,
    });
    userLayerRef.current = userLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: basemaps[activeBasemap] }),
        clusterLayer,
        userLayer,
      ],
      view: new View({
        center: fromLonLat([77.209, 28.6139]), // Default: New Delhi
        zoom: 5,
      }),
      overlays: [overlay],
    });

    // Popup on click
    map.on("click", (evt) => {
      const clusterFeature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (!clusterFeature) {
        overlay.setPosition(undefined);
        return;
      }

      const features = clusterFeature.get("features");
      if (!features || features.length > 1) return;

      const props = features[0].getProperties();
      const coords = features[0].getGeometry().getCoordinates();

      let content = `<div class="bg-white p-3 rounded-xl shadow-lg w-64 border border-gray-200">`;
      if (props.image) {
        content += `<img src="${props.image}" class="w-full h-28 object-cover rounded mb-2"/>`;
      }
      content += `
        <h3 class="font-semibold text-lg text-black">${props.name || "Location"}</h3>
        <div class="text-sm text-gray-600">${props.category || ""}</div>
        ${
          props.description
            ? `<p class="text-sm mt-2 text-gray-700">${props.description}</p>`
            : ""
        }
      </div>`;

      overlay.setPosition(coords);
      popupRef.current.innerHTML = content;
    });

    map.on("pointermove", (evt) => {
      map.getViewport().style.cursor = map.hasFeatureAtPixel(evt.pixel)
        ? "pointer"
        : "";
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(null);
    };
  }, [activeBasemap]);

  // Switch basemap
  useEffect(() => {
    if (mapInstance.current) {
      const baseLayer = mapInstance.current.getLayers().item(0);
      baseLayer.setSource(basemaps[activeBasemap]);
    }
  }, [activeBasemap]);

  // Add POIs
  useEffect(() => {
    const src = vectorSourceRef.current;
    if (!src) return;

    src.clear();

    const features = locations.map((loc) => {
      const f = new Feature({
        geometry: new Point(fromLonLat([loc.lng, loc.lat])),
      });
      f.setProperties({ type: "poi", ...loc });
      return f;
    });

    src.addFeatures(features);
  }, [locations]);

  // Handle search result
  useEffect(() => {
    if (!searchResult) return;
    const { lon, lat, name } = searchResult;
    const coord = fromLonLat([lon, lat]);

    const f = new Feature({ geometry: new Point(coord) });
    f.setProperties({
      type: "search",
      name,
      category: "Search Result",
    });
    vectorSourceRef.current.addFeature(f);

    mapInstance.current
      .getView()
      .animate({ center: coord, zoom: 14, duration: 800 });

    overlayRef.current.setPosition(coord);
    popupRef.current.innerHTML = `
      <div class="bg-white p-3 rounded-xl shadow-lg w-64 border">
        <h3 class="font-semibold text-lg text-black">${name}</h3>
        <div class="text-sm text-gray-600">Search Result</div>
      </div>
    `;
  }, [searchResult]);

  // ✅ Locate me
  const handleLocate = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = fromLonLat([longitude, latitude]);

        const userSource = userLayerRef.current.getSource();
        userSource.clear();

        // User marker
        const user = new Feature({ geometry: new Point(coords) });
        user.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: "#2563eb" }),
              stroke: new Stroke({ color: "white", width: 3 }),
            }),
          })
        );
        userSource.addFeature(user);

        // Accuracy circle
        const circle = new Feature(new CircleGeom(coords, accuracy));
        circle.setStyle(
          new Style({
            fill: new Fill({ color: "rgba(37, 99, 235, 0.15)" }),
            stroke: new Stroke({ color: "#2563eb", width: 1 }),
          })
        );
        userSource.addFeature(circle);

        // Zoom to user
        mapInstance.current
          .getView()
          .animate({ center: coords, zoom: 17, duration: 700 });

        // Popup
        overlayRef.current.setPosition(coords);
        popupRef.current.innerHTML = `
          <div class="bg-white p-3 rounded-xl shadow-lg w-64 border">
            <h3 class="font-semibold text-lg text-black">You are here</h3>
            <div class="text-sm text-gray-600">Accuracy: ~${Math.round(
              accuracy
            )}m</div>
          </div>
        `;

        onLocate?.({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("Geolocation error:", err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            alert("Location access denied. Please allow location.");
            break;
          case err.POSITION_UNAVAILABLE:
            alert("Location unavailable.");
            break;
          case err.TIMEOUT:
            alert("Location request timed out.");
            break;
          default:
            alert("Unable to retrieve location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="flex-1 relative">
      {/* Basemap Switcher */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex space-x-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg">
        {Object.keys(basemaps).map((name) => (
          <button
            key={name}
            onClick={() => setActiveBasemap(name)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              activeBasemap === name
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div ref={mapRef} className="w-full h-full" />
      <div ref={popupRef} className="absolute z-50" />
      <button
        onClick={handleLocate}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 z-50"
      >
        📍 Locate Me
      </button>
    </div>
  );
};

export default MapView;
