const express = require("express");
const fs = require("fs");
const path = require("path");

const multer = require("multer");
const EXIF = require('exif-js');
const GPXParser = require('gpxparser');

const pool = require("../util/db");
const fsUtils = require('../util/fs-utils');
const { get } = require("http");

const router = express.Router();
// const MulterAzureStorage = require('multer-azure-blob-storage').MulterAzureStorage;

// let storage;

// if (process.env.NODE_ENV === 'local') {
//   // Local storage configuration
//   storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './assets/temp_upload');
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname);
//     }
//   });
// } else {
//   // Azure Blob Storage configuration
//   storage = new MulterAzureStorage({
//     azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
//     containerName: 'your-container-name',
//     containerSecurity: 'blob',  // can be 'blob' or 'container'
//     blobName: function(req, file, cb) {
//       cb(null, file.originalname);
//     }
//   });
// }
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
  // Check if the input is a Unix timestamp (all digits and possibly a length typical for Unix timestamps) for datetime_modified
  if (/^\d{10,13}$/.test(str)) {
    const date = new Date(Number(str));
    return date.toISOString().replace('T', ' ').replace('Z', '').substring(0, 23);
  }
  // Check if the input is a simple date format ('5/26/2024') for date_uploaded
  else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [month, day, year] = str.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Handle original format
  else {
    const [datePart, timePart, subsecPart] = str.split(' ');
    const formattedDate = datePart.replace(/:/g, '-');
    return `${formattedDate} ${timePart}.${subsecPart}`;
  }
}

// Function to add image records to the database
async function addImageRecordsToDB(images, eventID, eventFolder) {
  for (const image of images) {
    // Define an object with column names as keys and values to be inserted
    const imageData = {
      event_id: eventID,
      file_path: eventFolder,
      file_name: image.filename,
      is_favorite: false,
      is_visible: true,
      is_hidden_from_album: false,
      datetime_original_local: convertTimestampToPostgresFormat(image.timestamp_str),
      datetime_modified: convertTimestampToPostgresFormat(image.modifiedDate),
      datetime_gpx_utc: image.timestamp_gpx_utc,
      datetime_adjusted_utc: image.timestamp_adjusted_utc,
      date_uploaded: convertTimestampToPostgresFormat(new Date().toLocaleDateString()),
      camera_brand: image.camera,
      camera_model: image.model,
      x_dim: image.x_dim,
      y_dim: image.y_dim,
      altitude: image.altitude,
      description: null,
    };

    let values = Object.values(imageData);    
    let query;

    if (image.gpsData != null) {
      // If gpsData is not null, include geom column using ST_SetSRID and ST_MakePoint for longitude and latitude
      values = values.concat([image.gpsData.longitude, image.gpsData.latitude]);
      query = `
        INSERT INTO ${process.env.DB_SCHEMA}.images (${Object.keys(imageData).join(", ")}, geom)
        VALUES (${Object.keys(imageData).map((_, index) => `$${index + 1}`).join(", ")}, ST_SetSRID(ST_MakePoint($${values.length - 1}, $${values.length}), 4326))
      `;
    } else {
      // Exclude geom data if gpsData is null
      query = `
        INSERT INTO ${process.env.DB_SCHEMA}.images (${Object.keys(imageData).join(", ")})
        VALUES (${Object.keys(imageData).map((_, index) => `$${index + 1}`).join(", ")})
      `;
    }
    // Execute the query with values
    await pool.query(query, values);
  }
}

/**
 * Converts array of track points to a PostGIS LINESTRING.
 * @param {Array} points - The track points.
 * @returns {String} The LINESTRING geometry as a string.
 */
const toLineString = (points) => {
  return 'LINESTRING(' + points.map(p => `${p.lon} ${p.lat}`).join(', ') + ')';
};

/**
 * Parses a GPX file and inserts its track as a LINESTRING into a PostgreSQL table.
 * @param {String} filePath - Path to the GPX file.
 * @param {Object} dbConfig - Database connection configuration.
 */
const getGpxTrackPostgisFormat = async (filePath) => {
  try {
    const gpxData = fs.readFileSync(filePath, 'utf8');
    const gpx = new GPXParser();
    gpx.parse(gpxData);

    if (gpx.tracks.length === 0 || gpx.tracks[0].points.length === 0) {
      throw new Error("No tracks found in the GPX file.");
    }

    const points = gpx.tracks[0].points;
    const gpxParsedData = {
      lineString: toLineString(points),
      fileName: gpx.metadata.name,
      totalDistance: Math.floor(gpx.tracks[0].distance.total),
      elevationMax: gpx.tracks[0].elevation.max,
      elevationMin: gpx.tracks[0].elevation.min,
      elevationPos: Math.round(gpx.tracks[0].elevation.pos * 10) / 10,
      elevationNeg: Math.round(gpx.tracks[0].elevation.neg * 10) / 10,
      dateStart: gpx.tracks[0].points[0].time,
      dateEnd: gpx.tracks[0].points[gpx.tracks[0].points.length - 1].time,
    };
    return gpxParsedData;
  } catch (error) {
    console.error('Failed to parse GPX file and insert data:', error);
  }
};

// Function to add image records to the database
async function addGpxRecordsToDB(files, eventID, eventFolder) {
  for (const file of files) {
    // Define an object with column names as keys and values to be inserted
    const gpxParsedData = await getGpxTrackPostgisFormat(file.path);
    const fileData = {
      event_id: eventID,
      file_path: eventFolder,
      file_name: file.filename,
      datetime_modified: convertTimestampToPostgresFormat(file.modifiedDate),
      date_uploaded: convertTimestampToPostgresFormat(new Date().toLocaleDateString()),
      file_name_original: gpxParsedData.fileName,
      track_distance: gpxParsedData.totalDistance,
      track_ele_max: gpxParsedData.elevationMax,
      track_ele_min: gpxParsedData.elevationMin,
      track_ele_pos: gpxParsedData.elevationPos,
      track_ele_neg: gpxParsedData.elevationNeg,
      track_date_start: gpxParsedData.dateStart,
      track_date_end: gpxParsedData.dateEnd,
      gpx_data: gpxParsedData.lineString,
    };

    // Extract column names and values, replacing empty strings with null
    const columns = Object.keys(fileData);
    const values = Object.values(fileData).map(value => (value === "" ? null : value));

    // Construct the query dynamically
    const query = `
      INSERT INTO ${process.env.DB_SCHEMA}.gpx_tracks (${columns.join(", ")})
      VALUES (${columns.map((_, index) => `$${index + 1}`).join(", ")})
    `;

    // Execute the query with values
    await pool.query(query, values);
  }
}

async function saveImages(exifImages, eventFolder) {
  const renamePromises = exifImages.map(async (image, index) => {
      // const timestampFormat = convertTimestampToFilenameFormat(image.timestamp_str);
      // const newFilename = `${eventID}_${timestampFormat}.jpg`;
      const newPath = path.join(eventFolder, 'images', image.filename);
      await fs.promises.rename(image.path, newPath);
      // Convert modifiedDate from milliseconds to seconds (which is required by utimes)
      const modifiedDateInSeconds = Math.floor(image.modifiedDate / 1000);

      // Set the access and modified times
      await fs.promises.utimes(newPath, new Date(), modifiedDateInSeconds);      
      return { ...image, modifiedDate: image.modifiedDate };
  });
  return Promise.all(renamePromises);
}

async function saveGpxFiles(files, eventFolder) {
  const renamePromises = files.map(async (file, index) => {
      const newPath = path.join(eventFolder, 'gpx', file.filename);
      await fs.promises.copyFile(file.path, newPath);
      // Convert modifiedDate from milliseconds to seconds (which is required by utimes)
      const modifiedDateInSeconds = Math.floor(file.modifiedDate / 1000);

      // Set the access and modified times
      await fs.promises.utimes(newPath, new Date(), modifiedDateInSeconds);      
      return { ...file, modifiedDate: file.modifiedDate };
  });
  return Promise.all(renamePromises);
}

// function createEventFolder(eventID, eventTitleEn) {
//   // Root folder for event
//   const dir = `./assets/events/${eventID} ${eventTitleEn}`;
//   if (!fs.existsSync(dir)){
//       fs.mkdirSync(dir, { recursive: true });
//   }
//   // Folder for images
//   const image_dir = `./assets/events/${eventID} ${eventTitleEn}/images`;
//   if (!fs.existsSync(image_dir)){
//       fs.mkdirSync(image_dir, { recursive: true });
//   }
//   // Folder for gpx files
//   const gpx_dir = `./assets/events/${eventID} ${eventTitleEn}/gpx`;
//   if (!fs.existsSync(gpx_dir)){
//       fs.mkdirSync(gpx_dir, { recursive: true });
//   }
//   // Folder for video files
//   const video_dir = `./assets/events/${eventID} ${eventTitleEn}/video`;
//   if (!fs.existsSync(video_dir)){
//       fs.mkdirSync(video_dir, { recursive: true });
//   }         
//   return dir;
// }

async function createEventFolder(eventID, eventTitleEn) {
  // Root folder for event
  const rootDir = path.join('./assets/events', `${eventID} ${eventTitleEn}`);
  // Subdirectories within the event folder
  const subdirs = ['images', 'gpx', 'video'];
  try {
    // Ensure the root directory exists
    await fs.promises.mkdir(rootDir, { recursive: true });
    // Create each subdirectory
    for (const subdir of subdirs) {
      await fs.promises.mkdir(path.join(rootDir, subdir), { recursive: true });
    }
  } catch (error) {
    console.error(`Failed to create directories: ${error.message}`);
    throw error; // Rethrow to handle the error outside of this function if necessary
  }

  return rootDir; // Returning the root directory path
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
  const exifData = await Promise.all(images.map(image => readExifData(image.path)));
  return images.map((image, index) => {
      const exif = exifData[index];
      return {
      ...image,
      camera: exif.Make || null,
      model: exif.Model || null,
      x_dim: exif.PixelXDimension || null,
      y_dim: exif.PixelYDimension || null,
      gps_version: exif.GPSVersionID || null,
      timestamp_str: exif.DateTimeOriginal 
        ? `${exif.DateTimeOriginal} ${exif.SubsecTimeOriginal ? exif.SubsecTimeOriginal : '000'}` 
        : null,      
      timestamp_gpx_utc: exif.GPSDateStamp ? convertExifGpsTimestampToPostgresFormat(exif) : null,
      timestamp_adjusted_utc: exif.GPSTimeStamp ? adjustDateTimeToUTC(exif) : null,
      gpsData: (exif.GPSLatitude && exif.GPSLongitude) ? getGPSData(exif) : null,
      altitude: exif.GPSAltitude ? exif.GPSAltitude.numerator / exif.GPSAltitude.denominator : null
      };
  });
}

// Function to handle the event statistics upload to the database
async function handleEventStatUpload(reqBody) {
  const {
    eventTitleRu,
    eventTitleEn,
    eventID,
    eventYoutube,
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

  // Combine date and time parts into a single string
  const startDateTime = `${eventStartDate} ${eventStartTime}`;
  // If the end date is provided, combine it with the end time
  const endDateTime = eventEndDate ? `${eventEndDate} ${eventEndTime}` : null;

  // Define an object with column names as keys and values to be inserted
  const eventData = {
    title_ru: eventTitleRu,
    title_en: eventTitleEn,
    id: eventID,
    event_type: eventType,
    duration_type: eventDuration,
    start_date: startDateTime,
    end_date: endDateTime,
    distance: eventDistance,
    commute_distance: eventCommute,
    time_total: eventTimeTotal,
    time_motion: eventTimeMotion,
    avg_speed: eventAvgSpeed,
    avg_motion_speed: eventAvgSpeedMotion,
    downhill: eventDownhill,
    uphill: eventUphill,
    min_altitude: eventMinAltitude,
    max_altitude: eventMaxAltitude,
  };

  // Extract column names and values, replacing empty strings with null
  const columns = Object.keys(eventData);
  const values = Object.values(eventData).map(value => (value === "" ? null : value));

  // Construct the query dynamically
  const query = `
    INSERT INTO ${process.env.DB_SCHEMA}.events (${columns.join(", ")})
    VALUES (${columns.map((_, index) => `$${index + 1}`).join(", ")})
  `;
  await pool.query(query, values);

  // Only proceed with this part if eventYoutube is not null
  if (eventYoutube !== "") {
    // Define an object with column names as keys and values to be inserted
    const youtubeData = {
      event_id: eventID,
      num: 1,  //TODO: Change this to a dynamic value
      link: eventYoutube,
    };

    // Extract column names and values, replacing empty strings with null
    const yt_columns = Object.keys(youtubeData);
    const yt_values = Object.values(youtubeData).map(value => (value === "" ? null : value));

    // Construct the query dynamically
    const yt_query = `
      INSERT INTO ${process.env.DB_SCHEMA}.youtube (${yt_columns.join(", ")})
      VALUES (${yt_columns.map((_, index) => `$${index + 1}`).join(", ")})
    `;
    await pool.query(yt_query, yt_values);
  }  
}

// Function to handle images upload
async function handleImagesUpload(images, eventID, eventFolder) {
  // Add EXIF data to the images
  const exifImages = await processExifData(images);
  const processedImages = await saveImages(exifImages, eventFolder);
  await addImageRecordsToDB(processedImages, eventID, eventFolder);
}

// Function to handle GPX files upload
async function handleGPXUpload(files, eventID, eventFolder) {
  // const gpxFiles = files['gpxFiles'] || [];
  const gpxFiles = await saveGpxFiles(files, eventFolder);
  await addGpxRecordsToDB(gpxFiles, eventID, eventFolder)
}

router.post("/api/upload-event",  upload.fields([{ name: 'images', maxCount: 999 }, { name: 'gpxFiles', maxCount: 999 }]), async (req, res) => {
  try {
    // Create a folder for the event
    const eventFolder = await createEventFolder(req.body.eventID, req.body.eventTitleEn);
    // Upload event stat data to the database
    await handleEventStatUpload(req.body);
    // Upload images to the server and database
    if (req.files.images && req.files.images.length > 0) {
      // Ensure gpxFilesModifiedDate is always an array
      const modifiedDates = Array.isArray(req.body.imagesModifiedDate)
                            ? req.body.imagesModifiedDate
                            : [req.body.imagesModifiedDate];       
      const imagesWithModifiedDate = req.files.images.map((image, index) => ({
        ...image,
        modifiedDate: modifiedDates[index]
      }));
      await handleImagesUpload(imagesWithModifiedDate, req.body.eventID, eventFolder);
    }    
    // Upload GPX files to the server and database
    if (req.files.gpxFiles && req.files.gpxFiles.length > 0) {
      // Ensure gpxFilesModifiedDate is always an array
      const modifiedDates = Array.isArray(req.body.gpxFilesModifiedDate)
                            ? req.body.gpxFilesModifiedDate
                            : [req.body.gpxFilesModifiedDate];      
      const gpxFilesWithModifiedDate = req.files.gpxFiles.map((gpxFile, index) => ({
        ...gpxFile,
        modifiedDate: modifiedDates[index]
      }));
      await handleGPXUpload(gpxFilesWithModifiedDate, req.body.eventID, eventFolder);
    }        
    await fsUtils.clearFolder(process.env.UPLOAD_FOLDER);
    res.status(200).send(`Event ${req.body.eventID} uploaded successfully`);
    console.log(`Event ${req.body.eventID} uploaded successfully`);  // TODO: Remove this line when frontend notification is ready
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
