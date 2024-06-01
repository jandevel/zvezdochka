import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderImage from "../../components/common/HeaderImage.jsx";
import EventList from "./components/EventList.jsx"

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <HeaderImage />
      <EventList events={events} />
    </>
  );
};

export default EventsPage;
