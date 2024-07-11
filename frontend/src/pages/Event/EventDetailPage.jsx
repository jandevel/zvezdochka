import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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

  return (
    <div>
      {eventDetails ? (
        <div>
          <h1>{eventDetails.title_en}</h1>
        </div>
      ) : (
        <p>Loading event details...</p>
      )}
    </div>
  );
};

export default EventDetailPage;