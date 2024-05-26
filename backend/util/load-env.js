const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const loadEnvFile = () => {
  const nodeEnv = process.env.ZDK_ENV || 'local'; // Default to 'local' if ZDK_ENV is not set
  const envFile = path.join(__dirname, '..', `.env.${nodeEnv}`);

  const envPath = path.resolve(__dirname, envFile);

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded environment variables from ${envFile}`);
  } else {
    console.warn(`No environment file found for ${envFile}`);
  }
};

module.exports = loadEnvFile;