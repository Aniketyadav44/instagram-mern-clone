const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const postSchema = mongoose.Schema(
  {
    photoUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    location: {
      type: String,
    },
    owner: {
      type: ObjectId,
      ref: "User",
    },
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

mongoose.model("Post", postSchema);
