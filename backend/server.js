const http = require("http");
const fs = require("fs");

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

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

app.listen(process.env.LISTEN_PORT, () => {
  console.log(
    `Server started on http://${process.env.BACKEND_HOST}:${process.env.LISTEN_PORT}`
  );
});
