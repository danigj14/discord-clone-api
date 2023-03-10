const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");

const User = require("../models/user");
const validationErrorHandler = require("../middlewares/validationErrorHandler");

const authRouter = express.Router();

authRouter.post(
  "/login",
  body("email").notEmpty().isEmail().withMessage("INVALID_EMAIL"),
  body("password").notEmpty().withMessage("INVALID_PASSWORD"),
  validationErrorHandler,
  async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.statusCode(400).json({ error: "INVALID_CREDENTIALS" });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.statusCode(400).json({ error: "INVALID_CREDENTIALS" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    return res.json({ token });
  }
);

authRouter.post(
  "/register",
  body("email").notEmpty().isEmail().withMessage("INVALID_EMAIL"),
  body("password").notEmpty().withMessage("INVALID_PASSWORD"),
  validationErrorHandler,
  async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "EMAIL_ALREADY_IN_USE" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User({ email, password: hashedPassword }).save();
    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET_KEY);

    return res.json({ token });
  }
);

module.exports = authRouter;
