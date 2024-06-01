const express = require("express");
const router = express.Router();

const pool = require("../util/db");

/**
 * GET /api/events
 * Retrieves all events from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response containing the retrieved events.
 * @throws {Error} - If there is an error retrieving the events.
 */
router.get("/api/events", async (req, res, next) => {
  try {
    const query = `
      SELECT e.*, i.file_name as image
      FROM ${process.env.DB_SCHEMA}.events e
      LEFT JOIN ${process.env.DB_SCHEMA}.images i ON e.album_cover_pic_id = i.id
      ORDER BY e.start_date DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
