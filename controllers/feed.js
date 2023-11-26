const Post = require("../models/post");
const Comment = require("../models/comment");

exports.createPost = async (req, res) => {
  try {
    console.log(req.body);
    req.body.author = req.user._id;
    const post = new Post(req.body);
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.addComment = async (req, res) => {
  try {
    req.body.author = req.user._id;
    const comment = new Comment({
      ...req.body,
      post: req.params.id,
    });

    await comment.save();

    await Post.findByIdAndUpdate(req.params.id, {
      $push: { comments: comment._id },
    });

    res.status(201).send(comment);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// get feed with pagination it param contains page number only 10 posts will be shown per page
// if page number is not provided then first 10 posts will be shown
exports.getFeed = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    console.log(page);
    const limit = 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find()
      .populate("author", "name")
      .populate("tags", "name")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    res.status(200).json({ posts });
  } catch (error) {
    res.status(400).send(error);
  }
};

// get comments from post id
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate("author", "name")
      .populate("tags", "name")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(400).send(error);
  }
};

// delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.pid);
    res.status(200).json({ post });
  } catch (error) {
    res.status(400).send(error);
  }
};

// middleware

exports.getPostById = async (req, res, next, id) => {
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({
        error: "Post not found",
      });
    }
    req.post = post;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Error fetching post",
    });
  }
};
