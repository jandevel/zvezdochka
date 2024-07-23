import React from 'react';

import "./EventSummaryTable.css";

const formatDate = (datetime) => {
  const date = new Date(datetime);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Month is zero-indexed
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;  // Use template literals to format the date
};

const formatTime = (datetime) => {
  const time = new Date(datetime);
  return time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hourCycle: 'h23', // Uses 24-hour cycle starting at 00
    hour12: false // Ensures no AM/PM is used
  });
};

const formatTimeNoSec = (timeString) => {
  return timeString.substring(0, 5); // Extracts the "hh:mm" part from "hh:mm:ss"
};

const EventSummaryTable = ({ event }) => {
  return (
    <table className="event-summary-table">
      <tbody>
        <tr>
          <td>Дата:</td>
          <td>{formatDate(event.start_date)}</td>
        </tr>
        <tr>
          <td>Дистанция:</td>
          <td>{event.distance} км</td>
        </tr>
        <tr>
          <td>Время старта:</td>
          <td>{formatTime(event.start_date)}</td>
        </tr>
        <tr>
          <td>Время финиша:</td>
          <td>{formatTime(event.end_date)}</td>
        </tr>
        <tr>
          <td>Общее время:</td>
          <td>{formatTimeNoSec(event.time_total)}</td>
        </tr>
        <tr>
          <td>Время в движении:</td>
          <td>{formatTimeNoSec(event.time_motion)}</td>
        </tr>
        <tr>
          <td>Средняя скорость:</td>
          <td>{event.avg_speed} км/ч</td>
        </tr>
        <tr>
          <td>Средняя скорость в движении:</td>
          <td>{event.avg_motion_speed} км/ч</td>
        </tr>
        <tr>
          <td>Набор высоты:</td>
          <td>{event.uphill} м</td>
        </tr>
        <tr>
          <td>Сброс высоты:</td>
          <td>{event.downhill} м</td>
        </tr>
        <tr>
          <td>Перепад высот:</td>
          <td>{event.min_altitude} - {event.max_altitude} м</td>
        </tr>
      </tbody>
    </table>
  );
};

export default EventSummaryTable;