import React from 'react';
import { Link } from 'react-router-dom';
import "./EventCard.css";

export default function EventCard({
  id,
  event_type,
  duration_type,
  title_en,
  title_ru,
  start_date,
  end_date,
  distance,
  commute_distance,
  time_total,
  time_motion,
  avg_speed,
  avg_motion_speed,
  uphill,
  downhill,
  min_altitude,
  max_altitude,
  album_cover_pic_id,
  image,
}) {
  const eventTypeMap = {0: 'Cycling', 1: 'Travel', 2: 'Year'};
  const durationTypeMap = {0: 'One-Day', 1: 'Multi-Day', 2: 'Long-Haul'};
  const imagePath = `/assets/events/${id} ${title_en}/images/${image}`;

  // Function to format date and time
  const formatDate = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleDateString(); // adjust the locale and options as necessary
  };

  const formatTime = (datetime) => {
    const time = new Date(datetime);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // 24-hour format without seconds
  };  

  return (
    <div class="card-details-wrapper">
      <Link to={`/event/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>    
        <li className="card-details">
            <div className="card-image">
              <img src={imagePath} alt="Event album cover" />
            </div>
            <div className="card-date">Date: {formatDate(start_date)}</div>
            <div className="card-distance">Distance: {distance}</div>
            <div className="card-title">{title_en}</div>
            <div className="card-tags">
              <span className="card-tags__event-type">{eventTypeMap[event_type]}</span> 
              <span className="card-tags__duration">{durationTypeMap[duration_type]}</span>
              <span className="card-tags__event-id">{id}</span>
            </div>
            <ul className="card-stat1">
              <li>Start Time: {formatTime(start_date)}</li>
              <li>End Time: {formatTime(end_date)}</li>
              <li>Time Total: {time_total}</li>
              <li>Time Motion: {time_motion}</li>
            </ul>
            <ul className="card-stat2">
              <li>Avg Speed (stops included): {avg_speed}</li>
              <li>Avg Motion Speed: {avg_motion_speed}</li>
              <li>Uphill: {uphill}</li>
              <li>Downhill: {downhill}</li>
              <li>Altitude Range: {min_altitude} - {max_altitude}</li>
            </ul>    
        </li>
      </Link>  
    </div>
  );
}
