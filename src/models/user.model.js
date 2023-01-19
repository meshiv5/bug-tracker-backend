const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
});

const User = new mongoose.model("user", UserSchema);
User.getJWT = async (user) => {
  return jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY, {
    expiresIn: "7days",
  });
};

const validateUser = (user) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  };
  return Joi.object(schema).validate(user);
};

module.exports = { User, validateUser };
