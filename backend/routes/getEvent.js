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
router.get("/api/events/:eventId", async (req, res, next) => {
  try {
    const eventId = req.params.eventId;    
    const query = `
      SELECT e.*
      FROM ${process.env.DB_SCHEMA}.events e
      WHERE e.id = $1
    `;
    const { rows } = await pool.query(query, [eventId]);
    if (rows.length > 0) {
      res.json(rows[0]);
      console.log(rows[0]);
    } else {
      res.status(404).send('Event not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
