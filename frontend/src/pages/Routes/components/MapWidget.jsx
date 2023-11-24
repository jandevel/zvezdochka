import React, { useEffect, useState } from "react";

import "./MapWidget.css";
import OsmMap from "../../../components/common/OsmMap";

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
    <div className="custom-map-container">
      <OsmMap center={POSITION} zoom={ZOOM} tracks={tracks} />
    </div>
  );
};

export default GPXTracksMap;
