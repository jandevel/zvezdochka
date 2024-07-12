import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

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
    // const extension = img.file_name.split('.').pop(); // Get the extension
    return {
      original: `/assets/events/${eventDetails.event.id} ${eventDetails.event.title_en}/images/${img.file_name}`,
      thumbnail: `/assets/events/${eventDetails.event.id} ${eventDetails.event.title_en}/thumbnails/thumb_${baseFileName}.webp`, // Constructed thumbnail path
      description: img.datetime_original_local
    };
  });
  console.log(images);

  // // Prepare the images for react-image-gallery
  // const images = eventDetails?.images.map(img => ({
  //   original: `/events/${img.event_id} ${eventDetails.event.title_en}/images/${img.file_name}`,
  //   thumbnail: `/events/${img.event_id} ${eventDetails.event.title_en}/thumbnails/${img.file_name}`,
  //   description: img.datetime_original_local
  // }));

  return (
    <div>
      {eventDetails ? (
        <div>
          <h1>{eventDetails.event.title_en}</h1>
          {eventDetails.images.length > 0 && (
            <ImageGallery items={images} />
          )}
        </div>
      ) : (
        <p>Loading event details...</p>
      )}
    </div>
  );
};

export default EventDetailPage;