const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: ObjectId,
      ref: "Registration",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: ObjectId,
        ref: "Registration",
      },
    ],
    post: {
      type: ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
