const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, required: true },
  hasFilled: { type: Boolean, required: true },
  age: { type: Number, required: true },
  distractibility: { type: Number, required: true },
  impulsiveness: { type: Number, required: true },
  lackOfSelfControl: { type: Number, required: true },
  procrastination: { type: Number, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
