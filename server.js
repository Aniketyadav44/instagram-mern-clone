const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MONGOURI } = require("./Keys");

//Database related'
mongoose.connect(MONGOURI);
mongoose.connection.on("connected", () => {
  console.log("Mongoose database connected successfully");
});

//App configs
require("./Models/user");
require("./Models/post");
const authRouter = require("./Routes/auth");
const postRouter = require("./Routes/post");
const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(authRouter);
app.use(postRouter);

//app listener
app.listen(port, () => {
  console.log("Server started at port", port);
});
