import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";

const App = () => {
  const [locations] = useState([
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
  ]);

  const [searchResult, setSearchResult] = useState(null);

  return (
    <div className="flex h-screen">
      <Sidebar
        locations={locations}
        onSelect={(loc) =>
          setSearchResult({ lon: loc.lng, lat: loc.lat, name: loc.name })
        }
        onSearch={(res) => setSearchResult(res)}
      />

      <MapView
        locations={locations}
        searchResult={searchResult}
        onLocate={(pos) => console.log("User location:", pos)}
      />
    </div>
  );
};

export default App;
