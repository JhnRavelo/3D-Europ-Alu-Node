require("dotenv").config();
const jwt = require("jsonwebtoken");
const { participations } = require("../database/models");

module.exports = async (partGame, res, prize) => {
    jwt.verify(
        partGame,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err)
            return res.json({
              success: "other",
              message: "Vous avez dépasser votre 24 heures pour participer",
            });
  
          if (!decoded?.id)
            return res.json({
              success: false,
              message: "Vous ne vous êtes pas identifier",
            });
          const isUser = await participations.findOne({
            where: { ID_participation: decoded.id },
          });
  
          if (!isUser)
            return res.json({
              success: false,
              message: "Vous ne vous êtes pas identifier",
            });

          if (isUser?.prize)
            return res.json({
              success: "other",
              message: "Vous avez déjà participer",
            });
          
          if (prize) {
            isUser.prize = prize;
            await isUser.save();
          }
          res.json({ success: true, user: isUser });
        }
      );
}