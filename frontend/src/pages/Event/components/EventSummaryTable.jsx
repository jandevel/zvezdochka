import React from 'react';

import "./EventSummaryTable.css";

const formatDate = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleDateString(); // adjust the locale and options as necessary
};

const formatTime = (datetime) => {
  const time = new Date(datetime);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // 24-hour format without seconds
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
          <td>{event.time_total}</td>
        </tr>
        <tr>
          <td>Время в движении:</td>
          <td>{event.time_motion}</td>
        </tr>
        <tr>
          <td>Средняя скорость:</td>
          <td>{event.avg_speed}</td>
        </tr>
        <tr>
          <td>Средняя скорость в движении:</td>
          <td>{event.avg_motion_speed}</td>
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