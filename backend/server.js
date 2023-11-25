const http = require("http");
const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const multer = require("multer");
const upload = multer();

const app = express();

// Use CORS middleware
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.post("/api/upload-event", upload.none(), async (req, res) => {
  console.log("Body: ", req.body);
  try {
    const {
      eventTitle,
      eventID,
      eventType,
      eventDuration,
      eventStartDate,
      eventEndDate,
      eventStartTime = "00:00:00",
      eventEndTime,
      eventDistance,
      eventCommute,
      eventTimeTotal,
      eventTimeMotion,
      eventAvgSpeed,
      eventAvgSpeedMotion,
      eventDownhill,
      eventUphill,
      eventMinAltitude,
      eventMaxAltitude,
    } = req.body;

    // Combine eventStartDate and eventStartTime
    const startDateTime = `${eventStartDate} ${eventStartTime}`;
    const endDateTime = eventEndDate
      ? `${eventEndDate} ${eventEndTime} || '00:00:00`
      : null;

    const query = `
      INSERT INTO events (
        title, id, event_type, duration_type, start_date, end_date,
        distance, commute_distance, time_total,
        time_motion, avg_speed, avg_motion_speed, downhill, uphill,
        min_altitude, max_altitude
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
    `;

    const values = [
      eventTitle,
      eventID,
      eventType,
      eventDuration,
      startDateTime,
      endDateTime,
      eventDistance,
      eventCommute,
      eventTimeTotal,
      eventTimeMotion,
      eventAvgSpeed,
      eventAvgSpeedMotion,
      eventDownhill,
      eventUphill,
      eventMinAltitude,
      eventMaxAltitude,
    ].map((value) => (value === "" ? null : value));

    await pool.query(query, values);

    res.status(200).send("Event uploaded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/tracks", async (req, res) => {
  try {
    /**
     * Retrieves the GPX tracks as GeoJSON from the database.
     *
     * @returns {string} The GeoJSON representation of the GPX tracks.
     */
    const query = "SELECT ST_AsGeoJSON(gpx_data) AS track FROM gpx_tracks;";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => JSON.parse(row.track)));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// API endpoint to get events
app.get("/api/events", async (req, res) => {
  try {
    const eventsQuery = "SELECT * FROM events"; // Adjust your query as needed
    const { rows } = await pool.query(eventsQuery);
    res.json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(process.env.LISTEN_PORT, () => {
  console.log(
    `Server started on http://${process.env.BACKEND_HOST}:${process.env.LISTEN_PORT}`
  );
});
