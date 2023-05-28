const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const { isSignedIn } = require("../controllers/auth");
const { createEvent, getEvents } = require("../controllers/event");

router.post(
  "/events",
  [
    check("title", "Title should be at least 3 characters").isLength({
      min: 3,
    }),
    check("version", "Version should be at least 1 character").isLength({
      min: 1,
    }),
  ],
  isSignedIn,
  createEvent
);

router.get("/events", isSignedIn, getEvents);

module.exports = router;
