const express = require("express");
const router = express.Router();

const { isUserSignedIn, isUserAuthenticated } = require("../controllers/auth");

const {
  getFeed,
  addComment,
  createPost,
  getComments,
  getUserPosts,
  deletePost,
} = require("../controllers/feed");

router.get("/feed", isUserSignedIn, getFeed);
router.post("/feed", isUserSignedIn, createPost);

router.get("/feed/:id/comment", isUserSignedIn, getComments);
router.post("/feed/:id/comment", isUserSignedIn, addComment);

router.get("/feed/:uid", isUserSignedIn, isUserAuthenticated, getUserPosts);
router.delete(
  "/feed/:pid/:uid",
  isUserSignedIn,
  isUserAuthenticated,
  deletePost
);

module.exports = router;
