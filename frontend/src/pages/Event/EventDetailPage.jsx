import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ImageGallery from 'react-image-gallery';
import OsmMap from "../../components/common/OsmMap";

import "./components/MapWidget.css";
import 'react-image-gallery/styles/css/image-gallery.css';
import './ImageGalleryCustomStyles.css'; // Ensure this comes after the default styles

const EventDetailPage = () => {
  const [eventDetails, setEventDetails] = useState(null);
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/events/${eventId}`);
        setEventDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const images = eventDetails?.images.map(img => {
    const baseFileName = img.file_name.split('.').slice(0, -1).join('.'); // Remove extension and keep filename
    return {
      original: `/assets/events/${eventDetails.event.id} ${eventDetails.event.title_en}/images/${img.file_name}`,
      thumbnail: `/assets/events/${eventDetails.event.id} ${eventDetails.event.title_en}/thumbnails/thumb_${baseFileName}.webp`, // Constructed thumbnail path
      description: img.datetime_original_local
    };
  });
  console.log(images);

  // This part is for extracting GPX data for the map component
  const tracks = eventDetails?.gpx ? (Array.isArray(JSON.parse(eventDetails.gpx)) ? JSON.parse(eventDetails.gpx) : [JSON.parse(eventDetails.gpx)]) : [];
  // const tracks = eventDetails?.gpx ? JSON.parse(eventDetails.gpx) : null;
  console.log("Data from API:", tracks); 
  const mapCenter = [43.653, -79.38];
  // const mapCenter = tracks ? { lat: tracks.coordinates[0][1], lng: tracks.coordinates[0][0] } : { lat: 0, lng: 0 }; // Adjust as needed based on GPX data structure
  const mapZoom = 12; // Default zoom level, adjust as necessary  

  return (
    <div>
      {eventDetails ? (
        <div>
          <h1>{eventDetails.event.title_en}</h1>
          <div className="event-custom-map-container">
            <OsmMap center={mapCenter} zoom={mapZoom} tracks={tracks} />
          </div>
          <h1>Фотографии</h1>
          {eventDetails.images.length > 0 && (
            <ImageGallery
            items={images}
            slideDuration={0} // Set the transition duration to 200ms
          />
          )}
        </div>
      ) : (
        <p>Loading event details...</p>
      )}
    </div>
  );
};

export default EventDetailPage;