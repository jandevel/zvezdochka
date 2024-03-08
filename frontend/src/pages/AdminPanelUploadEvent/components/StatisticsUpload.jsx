import { useState } from "react";
import "./StatisticsUpload.css";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const StatisticsUpload = () => {
  const [eventInput, setEventInput] = useState({
    eventTitle: "",
    eventID: "",
    eventType: "0",
    eventDuration: "0",
    eventStartDate: "",
    eventEndDate: "",
    eventStartTime: "",
    eventEndTime: "",
    eventDistance: "",
    eventCommute: "",
    eventTimeTotal: "",
    eventTimeMotion: "",
    eventAvgSpeed: "",
    eventAvgSpeedMotion: "",
    eventDownhill: "",
    eventUphill: "",
    eventMinAltitude: "",
    eventMaxAltitude: "",
  });

  const [fileInput, setFileInput] = useState({
    images: [],
    gpxFiles: [],
  });
  
  const handleFileChange = (type, files) => {
    setFileInput((prevFileInput) => ({
      ...prevFileInput,
      [type]: files,
    }));
  };  

  // Inside your component
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Create a FormData object to hold your data
    const formData = new FormData();

    // Append event data to formData
    Object.keys(eventInput).forEach((key) => {
      formData.append(key, eventInput[key]);
    });

    Object.keys(fileInput).forEach((key) => {
      Array.from(fileInput[key]).forEach((file) => {
        formData.append(key, file);
      });
    });
    // TODO: Append files to formData
    // formData.append('images', /* your images */);
    // formData.append('gpxFiles', /* your GPX files */);
    // console.log(formData);
    try {
      // Send POST request to your backend
      await axios.post(`${API_BASE_URL}/api/upload-event`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle successful upload (e.g., show a message or redirect)
      console.log("Event uploaded successfully!");
    } catch (error) {
      // Handle errors (e.g., show error message)
      console.error(error);
    }
  };

  function handleChange(inputIdentifier, newValue) {
    setEventInput((prevEventInput) => {
      const updatedEventInput = {
        ...prevEventInput,
        [inputIdentifier]: newValue,
      };
      // console.log(prevEventInput);
      // console.log(updatedEventInput);

      // If any of the date or time inputs change, recalculate total time
      if (
        [
          "eventStartDate",
          "eventEndDate",
          "eventStartTime",
          "eventEndTime",
        ].includes(inputIdentifier)
      ) {
        updatedEventInput.eventTimeTotal =
          calculateTotalTime(updatedEventInput);
      }

      // Recalculate average speed if distance changes or any inputs affecting total time change
      if (
        [
          "eventDistance",
          "eventStartDate",
          "eventEndDate",
          "eventStartTime",
          "eventEndTime",
        ].includes(inputIdentifier)
      ) {
        updatedEventInput.eventAvgSpeed =
          calculateAverageSpeed(updatedEventInput);
      }

      // Recalculate average speed for motion if distance changes or eventTimeMotion changes
      if (["eventDistance", "eventTimeMotion"].includes(inputIdentifier)) {
        updatedEventInput.eventAvgSpeedMotion =
          calculateAverageSpeedMotion(updatedEventInput);
      }

      return updatedEventInput;
    });
  }

  function calculateTotalTime(eventInput) {
    const startDate = eventInput.eventStartDate;
    const endDate = eventInput.eventEndDate || startDate; // Use startDate if endDate is null
    const startTime = eventInput.eventStartTime;
    const endTime = eventInput.eventEndTime;

    if (startDate && endDate && startTime && endTime) {
      const start = new Date(startDate + " " + startTime);
      const end = new Date(endDate + " " + endTime);
      const diff = end - start;

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        let minutes = Math.floor((diff / (1000 * 60)) % 60);
        // Ensure two-digit minutes
        minutes = minutes.toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }

    return "";
  }

  function calculateAverageSpeed(eventInput) {
    const distance = parseFloat(eventInput.eventDistance);
    const timeTotal = eventInput.eventTimeTotal;

    // Check if distance is a number and timeTotal is not empty and includes ":"
    if (isNaN(distance) || !timeTotal || !timeTotal.includes(":")) {
      return "";
    }

    const [hours, minutes] = timeTotal.split(":").map(Number);

    // Check if hours and minutes are numbers
    if (isNaN(hours) || isNaN(minutes)) {
      return "";
    }

    const totalTimeHours = hours + minutes / 60;

    // Check if totalTimeHours is greater than 0 to avoid division by zero
    if (totalTimeHours <= 0) {
      return "";
    }

    const avgSpeedTotal = distance / totalTimeHours;
    return avgSpeedTotal.toFixed(1); // One decimal place
  }

  function calculateAverageSpeedMotion(eventInput) {
    const distance = parseFloat(eventInput.eventDistance);
    const timeMotion = eventInput.eventTimeMotion;

    // Check if distance is a number and timeMotion is not empty and includes ":"
    if (isNaN(distance) || !timeMotion || !timeMotion.includes(":")) {
      return "";
    }

    const [hours, minutes] = timeMotion.split(":").map(Number);

    // Check if hours and minutes are numbers
    if (isNaN(hours) || isNaN(minutes)) {
      return "";
    }

    const totalMotionHours = hours + minutes / 60;

    // Check if totalMotionHours is greater than 0 to avoid division by zero
    if (totalMotionHours <= 0) {
      return "";
    }

    const avgSpeedMotion = distance / totalMotionHours;
    return avgSpeedMotion.toFixed(1); // One decimal place
  }

  return (
    <>
      <p className="upload-event-title">Upload Event</p>
      <form className="upload-event-form" onSubmit={handleSubmit}>
        <section id="event-title">
          <label htmlFor="event-title__input">Title</label>
          <input
            type="text"
            id="event-title__input"
            required
            value={eventInput.eventTitle}
            onChange={(event) => handleChange("eventTitle", event.target.value)}
          />
        </section>
        <section id="event-id">
          <label htmlFor="event-id__input">Event ID</label>
          <input
            type="text"
            id="event-id__input"
            required
            value={eventInput.eventID}
            onChange={(event) => handleChange("eventID", event.target.value)}
          />
        </section>
        <section id="event-type">
          <label htmlFor="event-type__select">Event Type</label>
          <select
            id="event-type__select"
            required
            value={eventInput.eventType}
            onChange={(event) => handleChange("eventType", event.target.value)}
          >
            <option value="0">Cycling</option>
            <option value="1">Travel & Hiking</option>
            <option value="2">Year</option>
          </select>
        </section>
        <section id="event-duration">
          <label htmlFor="event-duration__select">Event Duration</label>
          <select
            id="event-duration__select"
            required
            value={eventInput.eventDuration}
            onChange={(event) =>
              handleChange("eventDuration", event.target.value)
            }
          >
            <option value="0">One-Day</option>
            <option value="1">Multi-Day</option>
            <option value="2">Long-Haul</option>
          </select>
        </section>
        <section id="event-distance">
          <label htmlFor="event-distance__input">Distance</label>
          <input
            type="number"
            id="event-distance__input"
            value={eventInput.eventDistance}
            onChange={(event) =>
              handleChange("eventDistance", event.target.value)
            }
          />
        </section>
        <section id="event-commute">
          <label htmlFor="event-commute__input">Commute</label>
          <input
            type="number"
            id="event-commute__input"
            value={eventInput.eventCommute}
            onChange={(event) =>
              handleChange("eventCommute", event.target.value)
            }
          />
        </section>
        <section id="event-start-date">
          <label htmlFor="event-start-date__input">Start Date</label>
          <input
            type="date"
            id="event-start-date__input"
            required
            value={eventInput.eventStartDate}
            onChange={(event) =>
              handleChange("eventStartDate", event.target.value)
            }
          />
        </section>
        <section id="event-end-date">
          <label htmlFor="event-end-date__input">End Date</label>
          <input
            type="date"
            id="event-end-date__input"
            value={eventInput.eventEndDate}
            onChange={(event) =>
              handleChange("eventEndDate", event.target.value)
            }
          />
        </section>
        <section id="event-start-time">
          <label htmlFor="event-start-time__input">Start Time</label>
          <input
            type="time"
            id="event-start-time__input"
            value={eventInput.eventStartTime}
            onChange={(event) =>
              handleChange("eventStartTime", event.target.value)
            }
          />
        </section>
        <section id="event-end-time">
          <label htmlFor="event-end-time__input">End Time</label>
          <input
            type="time"
            id="event-end-time__input"
            value={eventInput.eventEndTime}
            onChange={(event) =>
              handleChange("eventEndTime", event.target.value)
            }
          />
        </section>
        <section id="event-time-total">
          <label htmlFor="event-time-total__input">Time Total</label>
          <input
            type="text"
            id="event-time-total__input"
            value={eventInput.eventTimeTotal || ""} // Fallback to empty string if null
            readOnly
          />
        </section>
        <section id="event-time-motion">
          <label htmlFor="event-time-motion__input">Time Motion</label>
          <input
            type="text"
            id="event-time-motion__input"
            value={eventInput.eventTimeMotion}
            onChange={(event) =>
              handleChange("eventTimeMotion", event.target.value)
            }
          />
        </section>
        <section id="event-avg-speed">
          <label htmlFor="event-avg-speed__input">Average Speed</label>
          <input
            type="number"
            id="event-avg-speed__input"
            value={eventInput.eventAvgSpeed}
            readOnly
          />
        </section>
        <section id="event-avg-speed-motion">
          <label htmlFor="event-avg-speed-motion__input">
            Average Speed Motion
          </label>
          <input
            type="number"
            id="event-avg-speed-motion__input"
            value={eventInput.eventAvgSpeedMotion}
            readOnly
          />
        </section>
        <section id="event-downhill">
          <label htmlFor="event-downhill__input">Downhill</label>
          <input
            type="number"
            id="event-downhill__input"
            value={eventInput.eventDownhill}
            onChange={(event) =>
              handleChange("eventDownhill", event.target.value)
            }
          />
        </section>
        <section id="event-uphill">
          <label htmlFor="event-uphill__input">Uphill</label>
          <input
            type="number"
            id="event-uphill__input"
            value={eventInput.eventUphill}
            onChange={(event) =>
              handleChange("eventUphill", event.target.value)
            }
          />
        </section>
        <section id="event-min-altitude">
          <label htmlFor="event-min-altitude__input">Min Altitude</label>
          <input
            type="number"
            id="event-min-altitude__input"
            value={eventInput.eventMinAltitude}
            onChange={(event) =>
              handleChange("eventMinAltitude", event.target.value)
            }
          />
        </section>
        <section id="event-max-altitude">
          <label htmlFor="event-max-altitude__input">Max Altitude</label>
          <input
            type="number"
            id="event-max-altitude__input"
            value={eventInput.eventMaxAltitude}
            onChange={(event) =>
              handleChange("eventMaxAltitude", event.target.value)
            }
          />
        </section>
        <section id="event-images">
          <label htmlFor="event-images__input">Upload Images</label>
          <input
            type="file"
            id="event-images__input"
            multiple
            onChange={(event) => handleFileChange('images', event.target.files)}
          />
        </section>
        <section id="event-gpx-files">
          <label htmlFor="event-gpx-files__input">Upload GPX Tracks</label>
          <input
            type="file"
            id="event-gpx-files__input"
            multiple
            onChange={(event) => handleFileChange('gpxFiles', event.target.files)}
          />
        </section>
        <button type="submit" className="button">
          Upload Event
        </button>
      </form>
    </>
  );
};

export default StatisticsUpload;
