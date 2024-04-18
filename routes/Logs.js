const express = require("express");
const router = express.Router();
const verifyRole = require("../middlewares/verifyRole");
require("dotenv").config();
const verifyJWT = require("../middlewares/verifyJWT");
const { getLogs, readLogs, } = require("../controllers/logsController");

router.post("/", verifyJWT, verifyRole(process.env.PRIME1), getLogs);
router.get("/", verifyJWT, verifyRole(process.env.PRIME1), readLogs);

module.exports = router;
