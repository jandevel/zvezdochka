import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ImageGallery from 'react-image-gallery';
import OsmMap from "../../components/common/OsmMap";
import EventSummaryTable from './components/EventSummaryTable';

import "./components/MapWidget.css";
import 'react-image-gallery/styles/css/image-gallery.css';
import './ImageGalleryCustomStyles.css'; // Ensure this comes after the default styles
import "./EventDetailPage.css";

const eventTypeMap = {0: 'Cycling', 1: 'Travel', 2: 'Year'};
const durationTypeMap = {0: 'One-Day', 1: 'Multi-Day', 2: 'Long-Haul'};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

const getZoomLevel = (distance) => {
  if (distance > 2000) return 4;
  if (distance > 1000) return 5;
  if (distance > 500) return 6;
  if (distance > 250) return 7;
  if (distance > 150) return 8;
  if (distance > 70) return 9;
  if (distance > 30) return 10;
  if (distance > 15) return 11;
  if (distance > 8) return 12;
  if (distance > 4) return 13;
  if (distance > 2) return 14;
  if (distance > 1) return 15;
  return 16;
};

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

  // This part is for extracting GPX data for the map component
  const tracks = eventDetails?.gpx ? (Array.isArray(JSON.parse(eventDetails.gpx)) ? JSON.parse(eventDetails.gpx) : [JSON.parse(eventDetails.gpx)]) : [];
  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;

  tracks.forEach(track => {
    track.coordinates.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
  });

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const mapCenter = [centerLng, centerLat]; 

  const distance = calculateDistance(minLat, minLng, maxLat, maxLng);
  const mapZoom = getZoomLevel(distance);

  // Function to format date
  const formatDate = (datetime) => {
    const date = new Date(datetime);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Month is zero-indexed
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;  // Use template literals to format the date
  };

  return (
    <div>
      {eventDetails ? (
        <div>
          <p className="event-detail-title">{eventDetails.event.title_ru}</p>        
          <div className="event-detail-data-wrapper">
            <div class="event-detail-head-stat">          
              <div className="event-detail-head-stat__left">
                <div>Дата: {formatDate(eventDetails.event.start_date)}</div>
                {eventDetails.event.distance !== null && (
                  <div>Дистанция: {eventDetails.event.distance} км</div>
                )}
                <div>Видео: <a href="https://youtube.com/link1" target="_blank" rel="noopener noreferrer">Первый день в Мексике</a></div>                 
              </div>            
              <div className="event-detail-head-stat__right">
                  <span className="event-tags__event-type">{eventTypeMap[eventDetails.event.event_type]}</span> 
                  <span className="event-tags__duration">{durationTypeMap[eventDetails.event.duration_type]}</span>
                  <span className="event-tags__event-id">{eventDetails.event.id}</span>
              </div>             
            </div>              
          </div>                    
          {eventDetails.images.length > 0 && (
            <>
              <p className="event-detail-section-header">Фотографии</p>             
              <ImageGallery
              items={images}
              slideDuration={0} // Set the transition duration to 200ms
              />
            </>            
          )}          
          {tracks && tracks.length > 0 && (
            <>
              <p className="event-detail-section-header">Карта маршрута</p>
              <div className="event-custom-map-container">
                <OsmMap center={mapCenter} zoom={mapZoom} tracks={tracks} />
              </div>
            </>
          )}
          <p className="event-detail-section-header">Статистика</p>
          <div className="event-detail-data-wrapper">
            <EventSummaryTable event={eventDetails.event} />
          </div>
          <div className="event-summary-footer"></div>                   
        </div>
      ) : (
        <p>Loading event details...</p>
      )}
    </div>
  );
};

export default EventDetailPage;