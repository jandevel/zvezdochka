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

    // Query to retrieve event details
    const eventQuery = `
      SELECT e.*
      FROM ${process.env.DB_SCHEMA}.events e
      WHERE e.id = $1
    `;
    const eventData = await pool.query(eventQuery, [eventId]);

    if (eventData.rows.length > 0) {
      const event = eventData.rows[0];

      // Query to retrieve associated images
      const imagesQuery = `
        SELECT file_path, file_name, datetime_original_local
        FROM ${process.env.DB_SCHEMA}.images
        WHERE event_id = $1
        ORDER BY datetime_original_local
      `;
      const imagesData = await pool.query(imagesQuery, [eventId]);

      // Combining event data with images
      const response = {
        event: event,
        images: imagesData.rows
      };

      res.json(response);
      console.log(response);
    } else {
      res.status(404).send('Event not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
