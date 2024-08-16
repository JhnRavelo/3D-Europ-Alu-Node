const express = require("express");
const router = express.Router();
require("dotenv").config();
const verifyJWT = require("../middlewares/verifyJWT");
const multer = require("multer");
const {
  addMessage,
  getMessage,
  getLastMessage,
  getUsers,
  getMessageNotif,
} = require("../controllers/messageController");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  verifyJWT,
  memoryStorage.fields([{ name: "file" }, { name: "img" }]),
  addMessage
);

router.post("/get", verifyJWT, getMessage);

router.get("/getlast", verifyJWT, getLastMessage);

router.get("/getUsers", verifyJWT, getUsers);

router.get("/getNotif", verifyJWT, getMessageNotif);

module.exports = router;
