// models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    fullName: {
      type: String,
      required: [true, "Please provide your full name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      // validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    passwordChangedAt: Date,
    profilePicture: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [150, "Bio cannot exceed 150 characters"],
      default: "",
    },
    location: {
      type: String,
      maxlength: [50, "Location cannot exceed 50 characters"],
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    postVisibility: {
      type: String,
      enum: ["only_me", "friends", "public", "followers"],
      default: "public",
    },

    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
userSchema.virtual("followersCount").get(function () {
  return this.followers?.length;
});

userSchema.virtual("followingsCount").get(function () {
  return this.followings?.length;
});

userSchema.virtual("postsCount").get(function () {
  return this.posts?.length;
});

userSchema.virtual("savedCount").get(function () {
  return this.savedPosts?.length;
});

// Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Set passwordChangedAt timestamp
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Cascade delete posts and comments when a user is deleted
// Full cascade cleanup on user deletion
userSchema.pre("deleteOne", { document: true }, async function (next) {
  try {
    const userId = this._id;

    // 1. Delete all posts by this user
    await this.model("Post").deleteMany({ author: userId });

    // 2. Delete all comments by this user
    await this.model("Comment").deleteMany({ author: userId });

    // 3. Remove likes and bookmarks from all posts
    await this.model("Post").updateMany(
      {},
      {
        $pull: {
          likes: userId,
          bookmarks: userId,
        },
      }
    );

    // 4. Remove userId from other users' arrays
    await this.model("User").updateMany(
      {},
      {
        $pull: {
          followers: userId,
          followings: userId,
          friends: userId,
          sentRequests: userId,
          friendRequests: userId,
          favorites: userId,
          blocked: userId,
        },
      }
    );

    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};


// Generating Password Reset Token
userSchema.methods.getResetToken = async function () {
    
    // Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes in milliseconds


    return resetToken;

}
// Check if password was changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

export default User;
