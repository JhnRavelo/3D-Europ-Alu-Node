const express = require("express");
const {
  addParticipation,
  getParticipation,
  addParticipationPrize,
  getPrize,
} = require("../controllers/participationController");
const router = express.Router();

router.post("/", addParticipation);
router.get("/", getParticipation);
router.post("/prize", addParticipationPrize);
router.get("/prize", getPrize);

module.exports = router;
