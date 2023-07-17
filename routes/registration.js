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
  getIdProofFileName,
  getIdProofURL,
  getReceiptFileName,
  getReceiptURL,
} = require("../controllers/registration");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");

const upload = multer({ storage: multer.memoryStorage() });

router.param("eventId", getEventCreatorById);

router.get("/register/:eventId", isSignedIn, isAuthenticated, getRegistrations);

router.post(
  "/register/:eventId",
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

router.get(
  "/register/idproof/:eventId/:registrationId",
  isSignedIn,
  isAuthenticated,
  getIdProofFileName,
  getIdProofURL
);

router.get(
  "/register/receipt/:eventId/:registrationId",
  isSignedIn,
  isAuthenticated,
  getReceiptFileName,
  getReceiptURL
);

module.exports = router;
