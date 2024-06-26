const environment = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `.env.${environment}` });
const express = require("express");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// import routes
const authRoutes = require("./routes/auth");
// const bannerRoutes = require('./routes/banner');
const eventRoutes = require("./routes/event");
const speakerRoutes = require("./routes/speaker");
const registrationRoutes = require("./routes/registration");
const feedRoutes = require("./routes/feed");

// middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// routes middleware
app.use("/api", authRoutes);
// app.use('/api', bannerRoutes);
app.use("/api", eventRoutes);
app.use("/api", speakerRoutes);
app.use("/api", registrationRoutes);
app.use("/api", feedRoutes);

// connect to mongoDB
//DB Connection
exports.dbConnect = mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => console.log(`Server is running on port ${port}`));

app.get("/", (req, res) => res.send("Hello World!"));
