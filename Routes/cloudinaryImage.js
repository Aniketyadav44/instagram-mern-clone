const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const requireLogin = require("../Middlewares/requireLogin");
const cloudinary = require("cloudinary");

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//router to delet image from cloudinary database
router.post("/delete", requireLogin, (req, res) => {
  cloudinary.v2.uploader.destroy(req.body.publicId, async (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    })
    .catch((err) => console.log(err));
});

module.exports = router;
