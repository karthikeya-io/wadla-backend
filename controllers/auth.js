const Admin = require("../models/admin");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

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

// protected routes
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
