import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { FullscreenControl } from 'react-leaflet-fullscreen';

import 'leaflet/dist/leaflet.css';
import "react-leaflet-fullscreen/styles.css";
import "./OsmMap.css";

const OsmMap = ({ center, zoom, tracks }) => {
  return (
    <MapContainer className="map" zoom={zoom} center={center}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {tracks.map((track, idx) => (
        <GeoJSON key={idx} data={track} />
      ))}
      <FullscreenControl position="topleft" />
    </MapContainer>
  );
};

export default OsmMap;