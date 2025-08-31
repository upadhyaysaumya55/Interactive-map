// App.jsx
import React, { useState } from "react";
import MapView from "./components/MapView";
import { categoryIcons, defaultIcon } from "./utils/icons"; // Import category icons

const App = () => {
  const [locations] = useState([
    {
      id: 1,
      name: "Taj Mahal",
      category: "monument",
      lat: 27.1751,
      lng: 78.0421,
      description: "An ivory-white marble mausoleum in Agra, India.",
      image: "https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg",
    },
    {
      id: 2,
      name: "India Gate",
      category: "monument",
      lat: 28.6129,
      lng: 77.2295,
      description: "War memorial located in New Delhi.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/0/09/India_Gate_in_New_Delhi_03-2016.jpg",
    },
    {
      id: 3,
      name: "Gateway of India",
      category: "monument",
      lat: 18.922,
      lng: 72.8347,
      description: "Historic arch-monument built in Mumbai.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/d/d3/Gateway_of_India_-Mumbai.jpg",
    },
    {
      id: 4,
      name: "Qutub Minar",
      category: "monument",
      lat: 28.5245,
      lng: 77.1855,
      description: "Tallest brick minaret in the world, Delhi.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/4/44/Qutub_-_Minar%2C_Delhi_%286994969674%29.jpg",
    },
    {
      id: 5,
      name: "Red Fort",
      category: "monument",
      lat: 28.6562,
      lng: 77.241,
      description: "Historic fort in Delhi, served as the Mughal residence.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/3/3e/Red_Fort_in_Delhi_03-2016_img3.jpg",
    },
    { id: 6, name: "Luxury Stay", category: "hotel", lat: 28.61, lng: 77.22, description: "5-star hotel", image: categoryIcons.hotel },
    { id: 7, name: "City Hospital", category: "hospital", lat: 28.63, lng: 77.21, description: "24/7 healthcare", image: categoryIcons.hospital },
    { id: 8, name: "Central Park", category: "park", lat: 28.64, lng: 77.23, description: "Recreation park", image: categoryIcons.park },
    { id: 9, name: "National Museum", category: "museum", lat: 28.61, lng: 77.22, description: "Indian history", image: categoryIcons.museum },
    { id: 10, name: "The Spice Hub", category: "restaurant", lat: 28.615, lng: 77.225, description: "Indian cuisine", image: categoryIcons.restaurant },
    { id: 11, name: "Shopping Mall", category: "shopping", lat: 28.62, lng: 77.23, description: "Retail center", image: categoryIcons.shopping },
    { id: 12, name: "City School", category: "school", lat: 28.625, lng: 77.21, description: "Primary school", image: categoryIcons.school },
    { id: 13, name: "Public Library", category: "library", lat: 28.63, lng: 77.215, description: "Books & study", image: categoryIcons.library },
    { id: 14, name: "Coffee Time", category: "cafe", lat: 28.635, lng: 77.22, description: "Cafe & snacks", image: categoryIcons.cafe },
    { id: 15, name: "City Theater", category: "theater", lat: 28.64, lng: 77.225, description: "Cinema hall", image: categoryIcons.theater },
    { id: 16, name: "Delhi Airport", category: "airport", lat: 28.5562, lng: 77.1, description: "International airport", image: categoryIcons.airport },
    { id: 17, name: "Railway Station", category: "trainstation", lat: 28.642, lng: 77.221, description: "Train connectivity", image: categoryIcons.trainstation },
    { id: 18, name: "Bus Stop", category: "busstop", lat: 28.645, lng: 77.215, description: "Local buses", image: categoryIcons.busstop },
    { id: 19, name: "Juhu Beach", category: "beach", lat: 19.1, lng: 72.83, description: "Mumbai beach", image: categoryIcons.beach },
    { id: 20, name: "Himalaya View", category: "mountain", lat: 30.1, lng: 78.3, description: "Mountain trek", image: categoryIcons.mountain },
    { id: 21, name: "City Zoo", category: "zoo", lat: 28.61, lng: 77.235, description: "Animal park", image: categoryIcons.zoo },
    { id: 22, name: "Cricket Stadium", category: "stadium", lat: 28.62, lng: 77.236, description: "Sports arena", image: categoryIcons.stadium },
    { id: 23, name: "Golden Temple", category: "temple", lat: 31.62, lng: 74.88, description: "Holy Sikh shrine", image: categoryIcons.temple },
    { id: 24, name: "St. Cathedral", category: "church", lat: 28.61, lng: 77.25, description: "Christian church", image: categoryIcons.church },
    { id: 25, name: "City Bank", category: "bank", lat: 28.65, lng: 77.23, description: "Financial services", image: categoryIcons.bank },
    { id: 26, name: "ATM Booth", category: "atm", lat: 28.66, lng: 77.231, description: "Cash withdrawal", image: categoryIcons.atm },
    { id: 27, name: "Pharmacy Plus", category: "pharmacy", lat: 28.662, lng: 77.233, description: "Medicines", image: categoryIcons.pharmacy },
    { id: 28, name: "Fuel Station", category: "gasstation", lat: 28.664, lng: 77.22, description: "Petrol & diesel", image: categoryIcons.gasstation },
    { id: 29, name: "Parking Lot", category: "parking", lat: 28.668, lng: 77.224, description: "Public parking", image: categoryIcons.parking },
    { id: 30, name: "River Bridge", category: "bridge", lat: 28.67, lng: 77.226, description: "Bridge crossing", image: categoryIcons.bridge },
    { id: 31, name: "City Market", category: "market", lat: 28.672, lng: 77.228, description: "Local bazaar", image: categoryIcons.market },
    { id: 32, name: "Delhi University", category: "university", lat: 28.68, lng: 77.23, description: "Education hub", image: categoryIcons.university },
    { id: 33, name: "Govt Office", category: "government", lat: 28.682, lng: 77.235, description: "Admin center", image: categoryIcons.government },
    { id: 34, name: "Police Station", category: "police", lat: 28.685, lng: 77.238, description: "Law enforcement", image: categoryIcons.police },
    { id: 35, name: "Fire Station", category: "firestation", lat: 28.688, lng: 77.24, description: "Fire rescue", image: categoryIcons.firestation },
    { id: 36, name: "Kids Playground", category: "playground", lat: 28.69, lng: 77.245, description: "Play area", image: categoryIcons.playground },
    { id: 37, name: "Embassy", category: "embassy", lat: 28.7, lng: 77.25, description: "Foreign embassy", image: categoryIcons.embassy },
    { id: 38, name: "Ferry Point", category: "ferry", lat: 19.07, lng: 72.87, description: "Boat rides", image: categoryIcons.ferry },
    { id: 39, name: "Sea Port", category: "port", lat: 19.05, lng: 72.88, description: "Cargo shipping", image: categoryIcons.port },
    { id: 40, name: "Trekking Path", category: "hikingtrail", lat: 30.2, lng: 78.4, description: "Mountain hike", image: categoryIcons.hikingtrail },
    { id: 41, name: "Cycling Track", category: "cycling", lat: 28.72, lng: 77.24, description: "Bicycle track", image: categoryIcons.cycling },
    { id: 42, name: "Fitness Gym", category: "gym", lat: 28.725, lng: 77.245, description: "Workout area", image: categoryIcons.gym },
    { id: 43, name: "Relax Spa", category: "spa", lat: 28.73, lng: 77.25, description: "Wellness spa", image: categoryIcons.spa },
    { id: 44, name: "The Beer Bar", category: "bar", lat: 28.74, lng: 77.26, description: "Drinks & food", image: categoryIcons.bar },
    { id: 45, name: "Night Club", category: "nightclub", lat: 28.75, lng: 77.27, description: "Dance & music", image: categoryIcons.nightclub },
    { id: 46, name: "Food Truck", category: "foodtruck", lat: 28.76, lng: 77.28, description: "Street food", image: categoryIcons.foodtruck },
    { id: 47, name: "Camping Site", category: "camping", lat: 30.3, lng: 78.5, description: "Outdoor camp", image: categoryIcons.camping },
    { id: 48, name: "Waterfall Point", category: "waterfall", lat: 30.35, lng: 78.55, description: "Scenic falls", image: categoryIcons.waterfall },
    { id: 49, name: "Desert Safari", category: "desert", lat: 26.9, lng: 70.9, description: "Desert tour", image: categoryIcons.desert },
    { id: 50, name: "Island Resort", category: "island", lat: 15.3, lng: 73.9, description: "Beach island", image: categoryIcons.island },
    { id: 51, name: "Textile Factory", category: "factory", lat: 28.77, lng: 77.29, description: "Industrial unit", image: categoryIcons.factory },
  ]);

  const [selectedLocation, setSelectedLocation] = useState(null);

  // Attach proper icons for each category
  const locationsWithIcons = locations.map((loc) => ({
    ...loc,
    icon: categoryIcons[loc.category.toLowerCase()] || defaultIcon,
  }));

  return (
    <div className="h-screen w-screen">
      <MapView
        locations={locationsWithIcons}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) =>
          setSelectedLocation({ lat: loc.lat, lng: loc.lng, name: loc.name })
        }
        onLocate={(pos) => console.log("User location:", pos)}
      />
    </div>
  );
};

export default App;
