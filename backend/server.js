// const http = require("http");


const express = require("express");
const cors = require("cors");
// require("dotenv").config();

// Import the environment loader function
const loadEnvFile = require('./util/load-env');
// Load the appropriate environment file
loadEnvFile();

// Register routes
const eventRoutes = require('./routes/getEventList');
const eventDetailRoutes = require('./routes/getEvent');
const trackRoutes = require('./routes/getTrackList');
const uploadEventRoutes = require('./routes/uploadEvent');


// const upload = multer();

// Multer storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (file.fieldname === 'images') {
//       cb(null, './assets/upload_files/images');
//     } else if (file.fieldname === 'gpxFiles') {
//       cb(null, './assets/upload_files/gpx');
//     } else {
//       // If the fieldname is unknown, you can either choose to throw an error or handle it differently
//       cb(new Error('Unknown field'), null);
//     }
//   },
//   filename: function (req, file, cb) {
//     // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     cb(null, file.originalname);
//   }
// });



const app = express();

// Use CORS middleware
app.use(cors());



// function clearTempFolder() {
//   const directory = './assets/temp_upload';
//   fs.readdir(directory, (err, files) => {
//       if (err) throw err;
//       for (const file of files) {
//           fs.unlink(path.join(directory, file), err => {
//               if (err) throw err;
//           });
//       }
//   });
// }


// function parseExifDate(exifDate) {
//   if (!exifDate) {
//       return null;
//   }
//     // Split the string into date and time parts
//     const parts = exifDate.split(' ');
//     // Replace colons in the date part with hyphens
//     const datePart = parts[0].replace(/:/g, '-');
//     // Reconstruct the full date-time string in a format recognized by JavaScript
//     const validDateString = datePart + 'T' + parts[1];
//     // Create a new Date object
//     const date = new Date(validDateString);
//   return date;
// }

// function readExifData(imagePath) {
//   return new Promise((resolve, reject) => {
//       fs.readFile(imagePath, (err, data) => {
//           if (err) {
//               reject(err);
//           } else {
//               try {
//                   const exifData = EXIF.readFromBinaryFile(data.buffer);
//                   resolve(exifData);
//               } catch (error) {
//                   reject(error);
//               }
//           }
//       });
//   });
// }



app.use(eventRoutes);
app.use(eventDetailRoutes);
app.use(trackRoutes);
app.use(uploadEventRoutes);


app.listen(process.env.LISTEN_PORT, () => {
  console.log(
    `Server started on http://${process.env.BACKEND_HOST}:${process.env.LISTEN_PORT}`
  );
});
