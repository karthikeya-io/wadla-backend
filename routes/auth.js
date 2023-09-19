const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const {
  signup,
  signin,
  getOtpForPasswordReset,
} = require("../controllers/auth");

// use this route only when you need to create admin user manually
// later you can comment this route
router.post(
  "/signup",
  [
    check("name", "name should be at least 3 char").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be at least 6 char").isLength({
      min: 6,
    }),
  ],
  signup
);

router.post(
  "/login",
  [
    check("email", "email is required").isEmail(),
    check("password", "password field is required").isLength({ min: 1 }),
  ],
  signin
);

router.post("/otp", getOtpForPasswordReset);

// router.get('/signout', signout);

// router.get('/testroute', isSignedIn, (req, res) => {
//     res.json(req.auth);
// }
// );

module.exports = router;
