const Speaker = require("../models/speaker");
const { check, validationResult } = require("express-validator");
const bucket = require("../initializeFirebase");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { Readable } = require("stream");


exports.createSpeaker = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  const data = req.body;
  data.event = req.event;

  try {
    const speaker = new Speaker(data);
    await speaker.save();
    return res.status(200).json({
      message: "Speaker created successfully",
      speaker,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error creating speaker",
    });
  }
};

// get speaker based on event id
exports.getSpeakers = async (req, res) => {
  try {
    const speakers = await Speaker.find({ event: req.event._id });
    return res.status(200).json({
      speakers,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error fetching speakers",
    });
  }
};

// exports.uploadSpearkerPicToFirebase = async (req, res) => {
// 	const uniqueId = uuidv4();
//   sharp(req.file.buffer)
//     .webp({ quality: 90 })
//     .toFile(`${uniqueId}.webp`)
//     .then(function (new_file_info) {
//       console.log("Image converted to webp format");
//     })
//     .catch(function (error) {
//       console.log("An error occurred during the conversion", error);
//     });
//   const blob = bucket.file(`speakers/${uniqueId}.webp}`);
//   const blobStream = blob.createWriteStream();

//   blobStream.on("error", (err) => {
//     next(err);
//   });

//   blobStream.on("finish", () => {
//     // The public URL can be used to directly access the file via HTTP
//     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//     res.status(200).send(publicUrl);
//   });

//   blobStream.end();
// };

exports.uploadSpearkerPicToFirebase = async (req, res, next) => {

  // if thers no file in req object then move to next middleware
  if (!req.file) {
    return next();
  }

	const uniqueId = uuidv4();
  const blob = bucket.file(`speakers/${uniqueId}.webp`);
  const blobStream = blob.createWriteStream({ resumable: false });

  let transform = sharp().webp({ quality: 10 });

  // Create a stream from the Buffer
  let bufferStream = new Readable();
  bufferStream.push(req.file.buffer);
  bufferStream.push(null);

  // Pipe the buffer stream into the transformation stream
  // and then into the blobStream
  bufferStream
    .pipe(transform)
    .pipe(blobStream)
    .on('finish', () => {
      // The public URL can be used to directly access the file via HTTP
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      req.body.profilePicPublicUrl = publicUrl;
			req.body.profilePicFileOrginalName = req.file.originalname;
			next();
    })
    .on('error', (err) => {
			console.log(err);
			res.status(400).json({
				error: "Error uploading speaker pic speaker not created"
			})
    });
};
