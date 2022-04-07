const express = require("express");
const router = express.Router();
const AuthController = require("../controller/auth");

router.post("/api/auth/signup", AuthController.createUser);

router.post("/api/auth/login", AuthController.Login);

router.get("/api/auth/verify/:id/:token/:recaptcha", AuthController.Verify);

router.post("/api/auth/resend", AuthController.Resend);

router.post("/api/auth/check-recover-code", AuthController.CheckRecoverCode);

router.post("/api/auth/forgot-password", AuthController.ForgotPassword);

router.post("/api/auth/recover-password", AuthController.RecoverPassword);

module.exports = router;
