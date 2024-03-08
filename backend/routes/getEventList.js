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
    const eventsQuery = "SELECT * FROM events";
    const { rows } = await pool.query(eventsQuery);
    res.json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
