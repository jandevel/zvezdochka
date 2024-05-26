/**
 * Creates a connection pool to the PostgreSQL database using the provided environment variables.
 * @module db
 */

const { Pool } = require("pg");

try {
  /**
   * The connection pool to the PostgreSQL database.
   * @type {Pool}
   */
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  console.log(`Database initialized: ${pool.options.host}`);

  module.exports = pool;
} catch (error) {
  console.error("Error connecting to the database:", error);
}
