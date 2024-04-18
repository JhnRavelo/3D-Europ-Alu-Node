const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  userRegistration,
  userLogin,
  userLogout,
  addUser,
  getUsers,
  updateUser,
  deleteUser,
  getCommercials,
  uploadUserImage,
  avatarUpdateUser,
  updateProfile,
  nbrUser,
} = require("../controllers/userController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRole = require("../middlewares/verifyRole");
const multer = require("multer");
const path = require("path");

const imgPath = path.join(__dirname, "..", "public", "dist", "img");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (file.fieldname == "avatar") {
      const homeImg = path.join(imgPath, "avatar");
      callback(null, homeImg);
    }
  },

  filename: function (req, file, callback) {
    callback(null, Buffer.from(file.originalname, "latin1").toString("utf8"));
  },
});

const upload = multer({
  storage: storage,
});

const multipleField = upload.fields([{ name: "avatar" }]);

router.post("/login", userLogin);

router.post("/", userRegistration);

router
  .route("/User/upload")
  .post(multipleField, uploadUserImage)
  .put(multipleField, uploadUserImage);

router.put("/avatar", verifyJWT, avatarUpdateUser);

router.get("/logout", verifyJWT, userLogout);

router
  .route("/User")
  .put(verifyJWT, verifyRole(process.env.PRIME1), updateUser)
  .post(verifyJWT, verifyRole(process.env.PRIME1), addUser);

router.delete(
  "/User/:id",
  verifyJWT,
  verifyRole(process.env.PRIME1),
  deleteUser
);

router.get("/getUsers", verifyJWT, verifyRole(process.env.PRIME1), getUsers);

router.put(
  "/User/pro",
  verifyJWT,
  verifyRole(process.env.PRIME1),
  updateProfile
);

router.post("/nbr", verifyJWT, verifyRole(process.env.PRIME1), nbrUser);

router.get("/getCommercials", verifyJWT, getCommercials);

module.exports = router;
