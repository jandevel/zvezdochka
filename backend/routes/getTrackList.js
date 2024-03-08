const express = require("express");
const router = express.Router();

const pool = require("../util/db");

/**
 * GET /api/tracks
 * Retrieves GPX tracks as GeoJSON from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the tracks are retrieved and sent as a response.
 */
router.get("/api/tracks", async (req, res, next) => {
  try {
    const query = "SELECT ST_AsGeoJSON(gpx_data) AS track FROM gpx_tracks;";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => JSON.parse(row.track)));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
