const Admin = require("../models/admin");
const User = require("../models/registration");
const Otp = require("../models/otp");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");

let transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  const admin = new Admin(req.body);
  try {
    await admin.save();
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      err: "NOT able to save admin in DB",
    });
  }

  return res.status(200).json({
    message: "Admin created successfully",
  });
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        error: "Admin email does not exists",
      });
    }
    if (!admin.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    const token = jwt.sign({ _id: admin._id }, process.env.SECRET, {
      expiresIn: "1h",
    });
    // put token in cookie
    // http only cookie
    // expiring time of cookie is 1 hour
    // samesite strict
    res.cookie("token", token, { maxAge: 3600000, sameSite: "strict" });

    // send response to front end
    const { _id, name } = admin;
    return res.json({ token, admin: { _id, name, email } });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Email does not exists",
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Admin signout successfully",
  });
};

// routes for registered user for WADLA
// otp based password reset and creation

exports.getOtpForPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "User with given email does not exists",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpData = new Otp({
      email,
      otp,
    });
    await otpData.save();
    // send otp to email

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP for password reset",
      text: `Your OTP for password reset is ${otp} valid for 10 minutes`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "OTP not sent",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message: "OTP sent successfully",
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error sending otp",
    });
  }
};

exports.setNewPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "User with given email does not exists",
      });
    }

    user.password = password;
    await user.save();
    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error updating password",
    });
  }
};

// protected routes
// middle ware
exports.isSignedIn = (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return res.status(401).json({
      error: "Access denied",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      error: "Access denied",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.admin = decoded;
    req.adminId = decoded._id;
    console.log(decoded);
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Access denied",
    });
  }
};

exports.isAuthenticated = (req, res, next) => {
  console.log(req.adminId);
  console.log(req.eventCreatorId);
  const checker =
    req.adminId && req.eventCreatorId && req.eventCreatorId.equals(req.adminId);
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isOtpValid = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const otpDb = await Otp.findOne({ email });
    if (!otpDb) {
      return res.status(400).json({
        error: "OTP not generated",
      });
    }
    if (otpDb.otp !== otp) {
      return res.status(400).json({
        error: "OTP is not valid or expired",
      });
    }
    if (otpDb.otp === otp && otpDb.expireAt > Date.now()) {
      next();
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error validating otp",
    });
  }
};
