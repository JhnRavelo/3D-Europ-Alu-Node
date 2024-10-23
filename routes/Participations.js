const express = require("express");
const { addParticipation, getParticipation, addParticipationPrize } = require("../controllers/participationController");
const router = express.Router();

router.post("/", addParticipation);
router.get("/", getParticipation);
router.post("/prize", addParticipationPrize);

module.exports = router;
