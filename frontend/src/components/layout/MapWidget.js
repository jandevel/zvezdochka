import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./MapWidget.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const POSITION = [43.653, -79.38];
const ZOOM = 9;

const GPXTracksMap = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // Fetch the tracks from the API
    fetch(`${API_BASE_URL}/api/tracks`)
      .then((response) => response.json())
      .then((data) => {
        // console.log("Data from API:", data); // Log the data so it can be inspected in the browser
        setTracks(data);
      })
      .catch((err) => {
        console.error("Error fetching tracks:", err);
      });
  }, []);

  return (
    <div>
      <MapContainer className="map" zoom={ZOOM} center={POSITION}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tracks.map((track, idx) => (
          <GeoJSON key={idx} data={track} />
        ))}
      </MapContainer>
    </div>
  );
};

export default GPXTracksMap;
