const { text } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const requireLogin = require("../Middlewares/requireLogin");

const Post = mongoose.model("Post");

//route to create and add post in mongoDB
router.post("/createpost", requireLogin, (req, res) => {
  const { photoUrl, caption, location } = req.body;
  if (!photoUrl) {
    return res.status(422).json({ error: "Image is required" });
  }
  req.user.password = undefined;
  const post = new Post({
    photoUrl,
    caption,
    location,
    owner: req.user,
  });
  post
    .save()
    .then((result) => {
      res.json({ message: "Post creted successfully." });
    })
    .catch((err) => {
      console.log(err);
    });
});

//route to get all posts
router.get("/allposts", requireLogin, (req, res) => {
  Post.find()
    .populate("owner", "_id username photoUrl")
    .populate("comments.postedBy", "_id username")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

//route to comment on post
router.put("/comment", requireLogin, (req, res) => {
  const { text, postedBy } = req.body;
  const comment = {
    text: text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    postedBy,
    {
      $push: { comments: comment },
    },
    { new: true }
  )
    .populate("comments.postedBy", "_id username")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    });
});

module.exports = router;
