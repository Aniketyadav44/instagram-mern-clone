const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");

const User = mongoose.model("User");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

//Route to signup and create user in mongodb
router.post("/signup", (req, res) => {
  const { username, email, password, name } = req.body;
  if (!username || !email || !password) {
    return res.status(422).json({ error: "Please add all the fields!" });
  }
  User.findOne({ username: username })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({
          error:
            "The username you entered already belong to an account. Please enter other username and try again.",
        });
      }

      //hashing the password using bcryptjs
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          username: username,
          email: email,
          password: hashedPassword,
          name: name,
        });
        user
          .save()
          .then((user) => {
            transporter.sendMail({
              to: user.email,
              from: "aniketbusiness4848@gmail.com",
              subject: "Signup success",
              html: `<h1>Hello ${user.name}</h1>
              <h3>Welcome to Instagram clone.</h3><p>Your account @${user.username} has been created successfully.</p>`,
            });
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
        return res.status(422).json({
          error:
            "The username you entered doesn't belong to an account. Please check your username and try again.",
        });
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
          const {
            _id,
            username,
            email,
            photoUrl,
            followers,
            following,
            verified,
            name,
            bio,
          } = user;
          transporter.sendMail({
            to: user.email,
            from: "aniketbusiness4848@gmail.com",
            subject: "New sign-in to Instagram",
            html: `<h1>Hello ${user.name}</h1>
            <h3>We noticed a new signin to your account @${user.username}</h3>
            <p>If you signed in recently then sit back and enjoy socializing. But if it's not you, then your account may be at risk. We recomment that <a href="http://localhost:3000/reset">You change your password</a> immediately to secure your account.</p>`,
          });
          res.json({
            token: token,
            user: {
              _id,
              username,
              email,
              photoUrl,
              followers,
              following,
              verified: verified,
              name: name,
              bio: bio,
            },
            message: "Logged In successfully",
          });
        } else {
          res.status(422).json({
            error:
              "Sorry, your password was incorrect. Please double-check your password.",
          });
        }
      });
    }
  );
});

//route to send mail
router.post("/sendmail", (req, res) => {
  const { to, subject, html } = req.body;
  transporter
    .sendMail({
      to: to,
      from: "aniketbusiness4848@gmail.com",
      subject: subject,
      html: html,
    })
    .then((result) => {
      res.json("Email sent");
    });
});

//route to send reset password mail
router.post("/reset-password", (req, res) => {
  const { username, email } = req.body;
  if (!email && !username) {
    return res.status(422).json({ error: "Please add all the fields!" });
  }
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ $or: [{ email: email }, { username: username }] }).then(
      (user) => {
        if (!user) {
          return res.status(422).json({
            error:
              "The email/username you entered doesn't belong to an account. Please check your email/username and try again.",
          });
        }
        user.resetToken = token;
        user.expireToken = Date.now() + 3600000;
        user.save().then((result) => {
          transporter.sendMail({
            to: user.email,
            from: "aniketbusiness4848@gmail.com",
            subject: "Reset Password",
            html: `<h1>Hello ${user.name},</h1><h3>You have requested to change your password for username @${user.username}.</h3><strong><p>Click <a href="http://localhost:3000/reset/${token}">this link</a> to change your password</p></strong>`,
          });
          res.json({ message: "Reset mail sent,Check inbox." });
        });
      }
    );
  });
});

//route to update password
router.post("/edit-password", (req, res) => {
  const { newPassword, userId, oldPassword } = req.body;
  User.findOne({ _id: userId })
    .then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "Some error occured, try again." });
      }
      //comparing both the passwords
      bcrypt.compare(oldPassword, user.password).then((doMatch) => {
        if (doMatch) {
          bcrypt.hash(newPassword, 12).then((hashedPassword) => {
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.expireToken = undefined;
            user.save().then((savedUser) => {
              res.json({ message: "Password changed!" });
            });
          });
        } else {
          res.status(422).json({
            error:
              "Sorry, your password was incorrect. Please double-check your password.",
          });
        }
      });
    })
    .catch((err) => console.log(err));
});

//route to change password
router.post("/new-password", (req, res) => {
  const { newPassword, sentToken } = req.body;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try again, session expired." });
      }
      //hashing the new password
      bcrypt.hash(newPassword, 12).then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((savedUser) => {
          res.json({ message: "Password changed!" });
        });
      });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
