const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const registrationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 64,
      trim: true,
    },
    email: {
      type: String,
      maxlength: 128,
      trim: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      maxlength: 16,
      trim: true,
    },
    encry_password: {
      type: String,
      maxlength: 256,
      trim: true,
    },
    salt: String,
    affiliation: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    designation: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    registrationCategory: {
      type: String,
      enum: [
        "Student - India",
        "Faculty/Educator - India",
        "Industry/R&D Person - India",
        "Student - Foreign",
        "Faculty/Educator - Foreign",
        "Industry/R&D Person - Foreign",
      ],
    },
    previousWorkshop: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    feedback: {
      type: String,
      maxlength: 5000,
      trim: true,
    },
    paymentReceiptFileOrginalName: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    PaymentReceiptFileName: {
      type: String,
      trim: true,
    },
    idProofFileOrginalName: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    idProofFileName: {
      type: String,
      trim: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true }
);

registrationSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

registrationSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("Registration", registrationSchema);
