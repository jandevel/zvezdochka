const express = require("express");
const fs = require("fs");
const path = require("path");

const multer = require("multer");
const EXIF = require('exif-js');

const pool = require("../util/db");

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets/temp_upload');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });


function convertTimestampToPostgresFormat(str) {
  // Extract date and time parts
  const [datePart, timePart, subsecPart] = str.split(' ');
  const formattedDate = datePart.replace(/:/g, '-');
  return `${formattedDate} ${timePart}.${subsecPart}`;
}

async function addImageRecordsToDB(images, eventID) {
  for (const image of images) {
      const query = `INSERT INTO zdk_dev.images (event_id, filename, filename_original, datetime_original_local, datetime_gpx_utc, datetime_adjusted_utc, camera, model, x_dim, y_dim, geom, altitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ST_SetSRID(ST_MakePoint($11, $12), 4326), $13)`;
      const values = [eventID, image.newFilename, image.originalname, convertTimestampToPostgresFormat(image.timestamp_str), image.timestamp_gpx_utc, image.timestamp_adjusted_utc, image.camera, image.model, image.x_dim, image.y_dim, image.gpsData.longitude, image.gpsData.latitude, image.altitude];
      await pool.query(query, values);
  }
}

function convertTimestampToFilenameFormat(str) {
  // Extract date and time parts
  const [datePart, timePart, subsecPart] = str.split(' ');
  // Remove colons from the date part and replace them with an underscore for the time part
  const formattedDate = datePart.replace(/:/g, '');
  const formattedTime = timePart.replace(/:/g, '');
  return `${formattedDate}-${formattedTime}-${subsecPart}`;
}

async function saveImages(exifImages, eventID, eventFolder) {
  const renamePromises = exifImages.map(async (image, index) => {
      const timestampFormat = convertTimestampToFilenameFormat(image.timestamp_str);
      const newFilename = `${eventID}_${timestampFormat}.jpg`;
      const newPath = path.join(eventFolder, newFilename);
      await fs.promises.rename(image.path, newPath);
      return { ...image, newFilename };
  });
  return Promise.all(renamePromises);
}

function createEventFolder(eventID, eventTitle) {
  const dir = `./assets/events/${eventID} ${eventTitle}`;
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getGPSData(exifData) {
  if (!exifData.GPSLatitude || !exifData.GPSLongitude) {
      return null;
  }
  // Convert GPS data to decimal degrees
  const convertToDecimal = (gpsData, ref) => {
      const degrees = gpsData[0].numerator / gpsData[0].denominator;
      const minutes = gpsData[1].numerator / gpsData[1].denominator;
      const seconds = gpsData[2].numerator / gpsData[2].denominator;
      let decimal = degrees + (minutes / 60) + (seconds / 3600);
      // South and West coordinates are negative
      if (ref === "S" || ref === "W") {
          decimal = decimal * -1;
      }
      return parseFloat(decimal.toFixed(6));
  };
  const latitude = convertToDecimal(exifData.GPSLatitude, exifData.GPSLatitudeRef);
  const longitude = convertToDecimal(exifData.GPSLongitude, exifData.GPSLongitudeRef);
  return { latitude, longitude };
}

function adjustDateTimeToUTC(metadata) {
  // Parse DateTimeOriginal into a Date object
  const [date, time] = metadata.DateTimeOriginal.split(' ');
  const [year, month, day] = date.split(':').map(Number);
  const [hour, minute, second] = time.split(':').map(Number);

  const originalDateTime = new Date(year, month - 1, day, hour, minute, second, metadata.SubsecTimeOriginal);

  // Calculate GPS time
  const gpsHour = metadata.GPSTimeStamp[0].numerator / metadata.GPSTimeStamp[0].denominator;
  const gpsMinute = metadata.GPSTimeStamp[1].numerator / metadata.GPSTimeStamp[1].denominator;
  const gpsSecond = metadata.GPSTimeStamp[2].numerator / metadata.GPSTimeStamp[2].denominator;
  const [gpsYear, gpsMonth, gpsDay] = metadata.GPSDateStamp.split(':').map(Number);

  const gpsDateTime = new Date(gpsYear, gpsMonth - 1, gpsDay, gpsHour, gpsMinute, gpsSecond);

  // Calculate difference in milliseconds and adjust
  let differenceMs = gpsDateTime - originalDateTime;

  // Round difference to nearest half-hour in milliseconds
  const halfHourMs = 30 * 60 * 1000;
  differenceMs = Math.round(differenceMs / halfHourMs) * halfHourMs;

  const adjustedDateTime = new Date(originalDateTime.getTime() + differenceMs);

  // Manually format date to include local timezone and milliseconds
  const pad = (num) => num.toString().padStart(2, '0');
  const formattedDate = `${adjustedDateTime.getFullYear()}-${pad(adjustedDateTime.getMonth() + 1)}-${pad(adjustedDateTime.getDate())} ${pad(adjustedDateTime.getHours())}:${pad(adjustedDateTime.getMinutes())}:${pad(adjustedDateTime.getSeconds())}.${metadata.SubsecTimeOriginal}`;

  return formattedDate;
}

function convertExifGpsTimestampToPostgresFormat(exifData) {
  // Extract and format the date
  const date = exifData.GPSDateStamp.replace(/:/g, '-');
  
  // Extract the time components from the GPSTimeStamp array
  const hours = exifData.GPSTimeStamp[0].numerator / exifData.GPSTimeStamp[0].denominator;
  const minutes = exifData.GPSTimeStamp[1].numerator / exifData.GPSTimeStamp[1].denominator;
  const seconds = exifData.GPSTimeStamp[2].numerator / exifData.GPSTimeStamp[2].denominator;
  
  // Format the time components to ensure they are two digits
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  // Concatenate the date and time into the desired format
  return `${date} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

async function readExifData(imagePath) {
  try {
    const data = await fs.promises.readFile(imagePath);
    const exifData = EXIF.readFromBinaryFile(data.buffer);
    return exifData;
  } catch (error) {
    throw error; // This will automatically reject the promise in an async function
  }
}

async function processExifData(images) {
  // Get EXIF data for each image
  // const exifPromises = images.map(image => readExifData(image.path));
  // const exifData = await Promise.all(exifPromises);
  const exifData = await Promise.all(images.map(image => readExifData(image.path)));
  return images.map((image, index) => ({
      ...image,
      camera: exifData[index].Make || null,
      model: exifData[index].Model || null,
      x_dim: exifData[index].PixelXDimension || null,
      y_dim: exifData[index].PixelYDimension || null,
      gps_version: exifData[index].GPSVersionID || null,
      timestamp_str: exifData[index].DateTimeOriginal 
        ? `${exifData[index].DateTimeOriginal} ${exifData[index].SubsecTimeOriginal ? exifData[index].SubsecTimeOriginal : '000'}` 
        : null,      
      timestamp_gpx_utc: convertExifGpsTimestampToPostgresFormat(exifData[index]),
      timestamp_adjusted_utc: adjustDateTimeToUTC(exifData[index]),
      gpsData: (exifData[index].GPSLatitude && exifData[index].GPSLongitude) ? getGPSData(exifData[index]) : null,
      altitude: exifData[index].GPSAltitude ? exifData[index].GPSAltitude.numerator / exifData[index].GPSAltitude.denominator : null
  }));
}

// Function to handle the event statistics upload to the database
async function handleEventStatUpload(reqBody) {
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
  } = reqBody;

  const startDateTime = `${eventStartDate} ${eventStartTime}`;
  const endDateTime = eventEndDate ? `${eventEndDate} ${eventEndTime}` : null;

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
}

// Function to handle images upload
async function handleImagesUpload(images, eventID, eventFolder) {
  // Add EXIF data to the images
  const exifImages = await processExifData(images);
  const processedImages = await saveImages(exifImages, eventID, eventFolder);
  await addImageRecordsToDB(processedImages, eventID);
}

// Function to handle GPX files upload
async function handleGPXUpload(files, eventID, eventTitle) {
  const gpxFiles = files['gpxFiles'] || [];
}

router.post("/api/upload-event",  upload.fields([{ name: 'images', maxCount: 999 }, { name: 'gpxFiles', maxCount: 999 }]), async (req, res) => {
  try {
    const eventFolder = createEventFolder(req.body.eventID, req.body.eventTitle);
    // Upload event data to the database
    await handleEventStatUpload(req.body);
    // Upload images to the server and database
    if (req.files.images && req.files.images.length > 0) {
      await handleImagesUpload(req.files.images, req.body.eventID, eventFolder);
    }    
    // Upload GPX files to the server and database
    // await handleGPXUpload(req.files, req.body.eventID, req.body.eventTitle);
    // await clearTempFolder
    res.status(200).send("Event uploaded successfully");
    console.log("Event uploaded successfully");  // TODO: Remove this line when frontend notification is ready
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
