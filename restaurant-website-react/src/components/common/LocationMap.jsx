import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom marker icon with restaurant theme
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F4A340" width="40" height="40">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to update map center when coordinates change
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const LocationMap = ({ center, city, address }) => {
  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        {/* OpenStreetMap tiles - Free to use */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker for delivery location */}
        <Marker position={center} icon={customIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-primary">Delivery Location</p>
              {city && <p className="text-sm">{city}</p>}
              {address && <p className="text-xs text-gray-600">{address}</p>}
            </div>
          </Popup>
        </Marker>

        {/* Update map view when center changes */}
        <ChangeMapView center={center} zoom={13} />
      </MapContainer>

      {/* Overlay with location info */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-dark shadow-lg z-20">
        📍 {city || "Your Location"}
      </div>
    </div>
  );
};

export default LocationMap;
