const express = require("express");
const router = express.Router();
const UserController = require("../controller/user");
const checkAuth = require("../middleware/check-auth");

router.get(
  "/api/user/get-has-filled/:userId",
  checkAuth,
  UserController.GetHasFilled
);

router.post("/api/user/survey", checkAuth, UserController.FillSurvey);
router.post("/api/user/create-to-do", checkAuth, UserController.CreateToDo);
router.post("/api/user/edit-to-do", checkAuth, UserController.EditToDo);
router.get(
  "/api/user/get-to-do/:width/:height/:today",
  checkAuth,
  UserController.GetToDo
);
router.get(
  "/api/user/get-outdated-todos",
  checkAuth,
  UserController.GetOutdatedTodos
);
router.get(
  "/api/user/get-finished-todos",
  checkAuth,
  UserController.GetFinishedTodos
);
router.get("/api/user/get-one-to-do/:id", checkAuth, UserController.GetOneToDo);
router.post(
  "/api/user/update-progress",
  checkAuth,
  UserController.UpdateProgress
);
router.delete(
  "/api/user/delete-to-do/:id",
  checkAuth,
  UserController.DeleteToDo
);
router.get("/api/user/get-user-info", checkAuth, UserController.GetUser);
router.post(
  "/api/user/update-profile",
  checkAuth,
  UserController.UpdateProfile
);
router.post(
  "/api/user/change-password",
  checkAuth,
  UserController.ChangePassword
);

module.exports = router;
