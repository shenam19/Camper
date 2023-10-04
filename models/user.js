const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  //   username: {
  //     type: String,
  //     required: [true, "Username can't be empty"],
  //   },
  //   password: {
  //     type: String,
  //     required: [true, "Please enter password"],
  //   },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: true,
  },
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
