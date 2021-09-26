const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  bio: {
    type: String,
  },
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    default:
      "https://res.cloudinary.com/aniketyadav/image/upload/v1632396298/no_image_h0h6lq.jpg",
  },
  followers: [{ type: ObjectId, ref: "User" }],
  following: [{ type: ObjectId, ref: "User" }],
  verified: {
    type: Boolean,
    default: false,
  },
});

mongoose.model("User", userSchema);
