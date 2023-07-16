const Registration = require("../models/registration");
const { check, validationResult } = require("express-validator");
const bucket = require("../initializeFirebaseWadlaPrivate");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { Readable } = require("stream");
const getSignedUrl = require("../utils/generateSignedUrlFB");

exports.createRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  const data = req.body;
  data.event = req.event;

  try {
    const registration = new Registration(data);
    await registration.save();
    return res.status(200).json({
      message: "Registration created successfully",
      registration,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Registration with given email already exists",
      });
    }

    return res.status(400).json({
      error: "Error creating registration",
    });
  }
};

// get registration based on event id
exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.event._id });
    return res.status(200).json({
      registrations,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error fetching registrations",
    });
  }
};

exports.getIdProofURL = async (req, res) => {
  try {
    const url = await getSignedUrl(`idProofs/${req.idProofFileName}`);
    return res.status(200).json({
      url,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error fetching id proof",
    });
  }
};

exports.getReceiptURL = async (req, res) => {
  try {
    const url = await getSignedUrl(`receipts/${req.receiptFileName}`);
    console.log("hello");
    console.log(req.receiptFileName);
    return res.status(200).json({
      url,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error fetching receipt",
    });
  }
};

// middle ware
// upload receipt to firebase (pdfs)
exports.uploadReceiptToFirebase = async (req, res, next) => {
  const uniqueId = uuidv4();
  const blob = bucket.file(`receipts/${uniqueId}.pdf`);
  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.files["receipt"][0].mimetype,
    },
  });
  blobWriter.on("error", (err) => {
    console.log(err);
    return res.status(400).json({
      error: "Error uploading receipt",
    });
  });
  blobWriter.on("finish", () => {
    // Assembling public URL for accessing the file via HTTP
    // const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
    //   bucket.name
    // }/o/${encodeURI(blob.name)}?alt=media`;
    req.body.PaymentReceiptFileName = uniqueId + ".pdf";
    req.body.paymentReceiptFileOrginalName =
      req.files["receipt"][0].originalname;
    next();
  });
  blobWriter.end(req.files["receipt"][0].buffer);
};

// upload id proof to firebase (img)

exports.uploadIdProofToFirebase = async (req, res, next) => {
  const uniqueId = uuidv4();
  const blob = bucket.file(`idProofs/${uniqueId}.webp`);
  const blobStream = blob.createWriteStream({ resumable: false });

  let transform = sharp().webp({ quality: 80 });

  // Create a stream from the Buffer
  let bufferStream = new Readable();
  bufferStream.push(req.files["proof"][0].buffer);
  bufferStream.push(null);

  // Pipe the buffer stream into the transformation stream
  // and then into the blobStream
  bufferStream
    .pipe(transform)
    .pipe(blobStream)
    .on("finish", () => {
      req.body.idProofFileName = uniqueId + ".webp";
      req.body.idProofFileOrginalName = req.files["proof"][0].originalname;
      next();
    })
    .on("error", (err) => {
      console.log(err);
      res.status(400).json({
        error: "Error uploading speaker pic speaker not created",
      });
    });
};

// get id proof file name using registration id
exports.getIdProofFileName = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);
    if (!registration || !req.event._id.equals(registration.event)) {
      return res.status(400).json({
        error: "Registration not found",
      });
    }
    req.idProofFileName = registration.idProofFileName;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error fetching registration",
    });
  }
};

// get receipt file name using registration id
exports.getReceiptFileName = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);
    if (!registration || !req.event._id.equals(registration.event)) {
      return res.status(400).json({
        error: "Registration not found",
      });
    }
    console.log("hi");
    console.log(registration.PaymentReceiptFileName);
    req.receiptFileName = registration.PaymentReceiptFileName;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error fetching registration",
    });
  }
};
