const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

console.log(process.env.JWT_SECRET);
const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: Number,
      maxLength: 10,
      unique: true,
    },

    favorite_sports: [
      {
        sport: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sport",
        },

        level: {
          type: String,
          enum: [
            "Beginner",
            "Professional",
            "Intermediate",
            "Coach/Trainer",
            "Advanced",
          ],
        },
      },
    ],

    objective: {
      type: String,
      enum: ["Fun", "Practice", "Improve Game"],
    },

    play_time: {
      type: String,
      enum: ["Weekends", "Daily", "Anytime"],
    },

    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },

    birthday: {
      type: Number,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
    },

    current_address: {
      name: {
        type: String,
      },
      lat: {
        type: String,
      },
      lng: {
        type: String,
      },
      line1: {
        type: String,
      },
      line2: {
        type: String,
      },
      line3: {
        type: String,
      },
      line4: {
        type: String,
      },
    },

    addresses: [
      {
        name: {
          type: String,
        },
        lat: {
          type: String,
        },
        lng: {
          type: String,
        },
        line1: {
          type: String,
        },
        line2: {
          type: String,
        },
        line3: {
          type: String,
        },
        line4: {
          type: String,
        },
      },
    ],
    country: {
      type: String,
    },
    new_user: {
      type: Boolean,
      default: true,
    },
    referral_code: {
      type: String,
    },

    bio: {
      type: String,
      default: null,
    },

    profession: {
      type: String,
      default: null,
    },

    bucks: {
      type: Number,
      default: 100,
    },

    img: {
      type: String,
    },

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    social_media: {
      instagram: {
        type: String,
        default: null,
      },
      facebook: {
        type: String,
        default: null,
      },
      linkedin: {
        type: String,
        default: null,
      },
      twitter: {
        type: String,
        default: null,
      },
    },

    posh_score: {
      type: Number,
      default: null,
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// generates authentication token and stores it and then updates the document
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// delete token
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  userObject.name = `${userObject.first_name} ${userObject.last_name}`;
  delete userObject.first_name;
  delete userObject.last_name;

  delete userObject.tokens;
  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
