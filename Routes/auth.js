const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../Keys");

const User = mongoose.model("User");

//Route to signup and create user in mongodb
router.post("/signup", (req, res) => {
  const { username, email, password, url } = req.body;
  if (!username || !email || !password) {
    return res.status(422).json({ error: "Please add all the fields!" });
  }
  User.findOne({ username: username })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "User already exists, try different username!" });
      }

      //hashing the password using bcryptjs
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          username: username,
          email: email,
          password: hashedPassword,
          photoUrl: url,
        });
        user
          .save()
          .then((user) => {
            res.json({ message: "User created successfully." });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//Route to signin the user and get token and user as json response
router.post("/signin", (req, res) => {
  const { username, email, password } = req.body;
  if ((!email && !username) || !password) {
    return res.status(422).json({ error: "Please add all the fields!" });
  }
  User.findOne(
    { $or: [{ email: email }, { username: username }] },
    (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!user) {
        return res
          .status(422)
          .json({ error: "Invalid username/email and password!" });
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign({ _id: user._id }, JWT_SECRET);
          const { _id, username, email, photoUrl, followers, following } = user;
          res.json({
            token: token,
            user: {
              _id,
              username,
              email,
              photoUrl,
              followers,
              following,
            },
          });
        } else {
          res
            .status(422)
            .json({ error: "Invalid username/email and password!" });
        }
      });
    }
  );
});

module.exports = router;
