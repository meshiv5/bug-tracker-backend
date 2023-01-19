const express = require("express");
const bcrypt = require("bcrypt");
const userRouter = express.Router();
const { User, validateUser } = require("../models/user.model");
const auth = require("../middlewares/auth.middleware");
const Joi = require("joi");
let blacklist = require("../utils/blacklist");
userRouter.post("/signup", async (req, res) => {
  try {
    let { email, password } = req.body;
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send({ status: false, message: error.details[0].message });
    let hashedPassword = await bcrypt.hash(password, 10);
    let user = new User({
      email: email,
      password: hashedPassword,
    });
    await user.save();
    res.status(200).send({ status: true, message: "User created succesfully ! Login To Conitnue" });
  } catch (e) {
    let paramsCausedError = Object.keys(e.keyValue || { "Some Details": 0 });
    res.status(400).send({ status: false, message: paramsCausedError[0] + " Already Exists . Try To Login Or Reset Password" });
  }
});
userRouter.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: email });
    if (!user) return res.status(404).send({ status: true, message: "User Does Not Exist" });
    let isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched || email !== user.email) return res.status(401).send({ status: true, message: "Wrong Password ! Try Again" });
    let token = await User.getJWT(user);
    res.header("Access-Control-Expose-Headers", "access_token");
    res.setHeader("access_token", JSON.stringify(token)).status(200).send({ status: true, message: "Logged In Successfully" });
  } catch (e) {
    let paramsCausedError = Object.keys(e.keyValue || { "Some Details": 0 });
    res.status(400).send({ status: false, message: paramsCausedError[0] + " Already Exists . Try To Login Or Change Password" });
  }
});

userRouter.get("/logout", (req, res) => {
  const token = req.headers['access-token'];
  blacklist.push(token);
  res.status(200).send("Logged Out Succesfully !");
});

userRouter.get("/", auth, (req, res) => {
  return res.status(200).json({ status: true, data: req.user });
});

const validate = (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  };

  return Joi.object(schema).validate(req);
};
module.exports = userRouter;
