const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { getEventCreatorById } = require("../controllers/event");
const multer = require("multer");
const {
  createRegistration,
  getRegistrations,
  uploadReceiptToFirebase,
  uploadIdProofToFirebase,
} = require("../controllers/registration");

const upload = multer({ storage: multer.memoryStorage() });

router.param("eventId", getEventCreatorById);

router.post(
  "/register/:eventId",
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  upload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "proof", maxCount: 1 },
  ]),
  [
    check("name", "name should be at least 2 char").isLength({ min: 2 }),
    check("email", "email is required").isEmail(),
  ],
  uploadReceiptToFirebase,
  uploadIdProofToFirebase,
  createRegistration
);

module.exports = router;
