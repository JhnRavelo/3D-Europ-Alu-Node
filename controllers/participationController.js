const { participations } = require("../database/models");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const axios = require("axios");
const getParticipationJWT = require("../utils/getParticipationJWT");

const addParticipation = async (req, res) => {
  try {
    const { email, fullName, phone } = await req.body;
    const partGame = await req.cookies?.partGame;

    if (!email || !fullName || !phone)
      return res.json({ success: false, message: "Données non remplie" });
    const emailExist = await participations.findOne({
      where: {
        [Op.or]: [{ email: email }, { fullName: fullName }, { phone: phone }],
      },
    });

    if (partGame)
      return res.json({ success: false, message: "Vous avez déjà participer" });

    if (emailExist)
      return res.json({ success: false, message: "Vous avez déjà participer" });
    const apiUrl = `https://api.zerobounce.net/v2/validate?api_key=${process.env.ZERO_BOUNCE_API}&email=${email}`;
    const verifyMail = await axios.get(apiUrl);

    if (verifyMail.data.status !== "valid")
      return res.json({ success: false, message: "Email non valide" });
    const newParticipant = await participations.create({
      email,
      fullName,
      phone,
    });

    if (!newParticipant)
      return res.json({
        success: false,
        message: "Participant non enregistrer",
      });
    const dataToken = jwt.sign(
      {
        id: newParticipant.ID_participation,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "2d",
      }
    );
    res.cookie("partGame", dataToken, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, id: dataToken });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur introuvable" });
    console.log("ERROR ADD PARTICIPATION", error);
  }
};

const getParticipation = async (req, res) => {
  try {
    const partGame = await req.cookies?.partGame;

    if (!partGame)
      return res.json({
        success: false,
        message: "Vous ne vous êtes pas identifier",
      });
    getParticipationJWT(partGame, res);
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur introuvable" });
    console.log("ERROR GET PARTICIPATION", error);
  }
};

const addParticipationPrize = async (req, res) => {
  try {
    const { prize } = await req.body;
    const partGame = await req.cookies?.partGame;

    if (!prize || !partGame)
      return res.json({ success: false, message: "Donnée non remplie" });
    getParticipationJWT(partGame, res, prize);
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur introuvable" });
    console.log("ERROR ADD PARTICIPANT PRIZE", error);
  }
};

module.exports = { addParticipation, getParticipation, addParticipationPrize };
