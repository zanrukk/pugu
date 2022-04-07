const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/user");
const VerifyToken = require("../models/verifyToken");
const ForgotToken = require("../models/forgotToken");

exports.createUser = async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    if (req.body.username.includes("@")) {
      res.status(400).json({
        message: "Username cannot include '@' character!",
      });
    }
    pass = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: pass,
      isVerified: false,
      hasFilled: false,
      age: 1,
      distractibility: 1,
      impulsiveness: 1,
      lackOfSelfControl: 1,
      procrastination: 1,
    });
    let searchWithEmail = await User.findOne({
      email: req.body.email,
    });
    let searchWithUsername = await User.findOne({
      username: req.body.username,
    });
    if (searchWithEmail) {
      res.status(400).json({
        message: "Email already exists!",
      });
    } else if (searchWithUsername) {
      res.status(400).json({
        message: "Username already exists!",
      });
    } else {
      result = await user.save();
      let random = Math.floor(Math.random() * 700000) + 199999;
      let token = await new VerifyToken({
        userId: result._id,
        token: random.toString(),
      }).save();
      const message = token.token;
      await transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
        to: req.body.email,
        subject: "Verification Code",
        text: message,
      });
      const fetchUserId = await User.findOne({ username: req.body.username });
      res.status(201).json({
        message: fetchUserId._id,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
    });
  }
};

exports.Login = async (req, res, next) => {
  try {
    let fetchedUser;
    let user;
    if (
      req.body.recaptcha === undefined ||
      req.body.recaptcha === null ||
      req.body.recaptcha === ""
    ) {
      return res.status(400).json({
        message: "Are you a robot?",
      });
    }
    const responseRecaptcha = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify?secret=" +
        process.env.RECAPTCHA_SECRET_KEY +
        "&response=" +
        req.body.recaptcha
    );
    if (!responseRecaptcha.data.success) {
      return res.status(400).json({
        message: "Are you a robot?",
      });
    }
    if (req.body.usernameOrMail.includes("@")) {
      user = await User.findOne({ email: req.body.usernameOrMail });
    } else {
      user = await User.findOne({ username: req.body.usernameOrMail });
    }
    if (!user) {
      return res.status(400).json({
        message: "There is no user with this username/email!",
      });
    } else {
      fetchedUser = user;
      check = await bcrypt.compare(req.body.password, user.password);
      if (!check) {
        return res.status(401).json({
          message: "Password is wrong!",
        });
      } else {
        if (!user.isVerified) {
          return res.status(400).json({
            message: "Account is not verified!",
          });
        } else {
          const token = jwt.sign(
            { username: fetchedUser.username, userId: fetchedUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "10h" }
          );
          res.status(200).json({
            token: token,
            expiresIn: 36000,
            userId: fetchedUser._id,
            username: fetchedUser.username,
            message: "success",
            hasFilled: fetchedUser.hasFilled,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Auth failed!",
    });
  }
};

exports.Verify = async (req, res, next) => {
  try {
    if (
      req.params.recaptcha === undefined ||
      req.params.recaptcha === null ||
      req.params.recaptcha === ""
    ) {
      return res.status(400).json({
        message: "Are you a robot?",
      });
    }
    const responseRecaptcha = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify?secret=" +
        process.env.RECAPTCHA_SECRET_KEY +
        "&response=" +
        req.params.recaptcha
    );
    if (!responseRecaptcha.data.success) {
      return res.status(400).json({
        message: "Are you a robot?",
      });
    }
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await VerifyToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");
    await User.updateOne({ _id: user._id }, { isVerified: true });
    await VerifyToken.findByIdAndRemove(token._id);
    res.status(200).json({ message: "Email verified sucessfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error!" });
  }
};

exports.Resend = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("There is no user with this email!");
    else {
      if (user.isVerified) {
        return res.status(400).send("This user is already verified!");
      } else {
        await VerifyToken.findOneAndRemove({ userId: user._id });
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });
        let random = Math.floor(Math.random() * 700000) + 199999;
        let token = await new VerifyToken({
          userId: user._id,
          token: random.toString(),
        }).save();
        const message = token.token;
        await transporter.sendMail({
          from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
          to: req.body.email,
          subject: "Verification Code",
          text: message,
        });
        res.status(201).json({
          message: user._id,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error!" });
  }
};

exports.CheckRecoverCode = async (req, res, next) => {
  try {
    if (
      req.body.recaptcha === undefined ||
      req.body.recaptcha === null ||
      req.body.recaptcha === ""
    ) {
      return res.status(400).json({
        message: "Are you a robot?",
      });
    }
    const responseRecaptcha = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify?secret=" +
        process.env.RECAPTCHA_SECRET_KEY +
        "&response=" +
        req.body.recaptcha
    );
    if (!responseRecaptcha.data.success) {
      return res.status(400).json({
        message: "Are you a robot?",
      });
    }
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) return res.status(400).send("Invalid link");
    const token = await ForgotToken.findOne({
      userId: user._id,
      token: req.body.code,
    });
    if (!token) return res.status(400).send("Invalid link");
    res.status(200).json({ message: "Valid" });
  } catch (error) {
    res.status(500).json({ message: "Error!" });
  }
};

exports.ForgotPassword = async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    let fetchedUser;
    let user;
    if (req.body.usernameOrMail.includes("@")) {
      user = await User.findOne({ email: req.body.usernameOrMail });
    } else {
      user = await User.findOne({ username: req.body.usernameOrMail });
    }
    if (!user) {
      return res.status(400).json({
        message: "There is no user with this username/mail!",
      });
    }
    fetchedUser = user;
    await ForgotToken.findOneAndRemove({ userId: fetchedUser._id });
    let now = new Date();
    let dateForToken = new Date(now.getTime() + 900000);
    let random = Math.floor(Math.random() * 700000) + 199999;
    let token = await new ForgotToken({
      userId: fetchedUser._id,
      token: random.toString(),
      date: dateForToken.toString(),
    }).save();
    const message = token.token;
    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
      to: fetchedUser.email,
      subject: "Recover Code",
      text: message,
    });
    res.status(200).json({
      message: fetchedUser._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error!" });
  }
};

exports.RecoverPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.body.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await ForgotToken.findOne({
      userId: user._id,
      token: req.body.token,
    });
    if (!token) return res.status(400).send("Invalid link");
    let now = new Date();
    let tokenDate = Date.parse(token.date);
    if (now > tokenDate) {
      await ForgotToken.findOneAndRemove({
        userId: user._id,
        token: req.body.token,
      });
      res.status(500).json({ message: "The token is out of date!" });
    }
    pass = await bcrypt.hash(req.body.password, 10);
    await User.updateOne({ _id: user._id }, { password: pass });
    await ForgotToken.findByIdAndRemove(token._id);
    res.status(200).json({ message: "Password is changed sucessfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error!" });
  }
};
