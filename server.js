require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//Database related'
const URI = process.env.MONGOURI;
mongoose.connect(URI);
mongoose.connection.on("connected", () => {
  console.log("Mongoose database connected successfully");
});

//App configs
require("./Models/user");
require("./Models/post");
const authRouter = require("./Routes/auth");
const postRouter = require("./Routes/post");
const userRouter = require("./Routes/user");
const cloudinaryRouter = require("./Routes/cloudinaryImage");
const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(authRouter);
app.use(postRouter);
app.use(userRouter);
app.use(cloudinaryRouter);

//If we are on production(deployed)
if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//app listener
app.listen(port, () => {
  console.log("Server started at port", port);
});
