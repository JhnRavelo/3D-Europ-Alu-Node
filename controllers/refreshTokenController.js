const jwt = require("jsonwebtoken");
require("dotenv").config();
const { users } = require("../database/models");

handleRefreshToken = async (req, res) => {
  try {
    const cookie = await req.cookies;

    if (!cookie?.jwt) return res.sendStatus(401);

    const refreshToken = cookie.jwt;

    res.clearCookie("jwt", {
      httpOnly: true,
      // sameSite: "None",
      secure: true,
    });

    const user = await users.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return res.sendStatus(403);
          }
          const hackedUser = await users.findOne({
            where: {
              ID_user: decoded.id,
            },
          });
          console.log("hacked");
          hackedUser.refreshToken = "";
          await hackedUser.save();
        }
      );

      return res.sendStatus(403);
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          user.refreshToken = "";
          await user.save();
        }

        if (err || user.ID_user !== decoded.id) return res.sendStatus(403);

        const id = user.ID_user,
          role = user.role,
          newRefreshToken = users.prototype.generateRefreshToken(decoded.id),
          accessToken = users.prototype.generateToken(id, role);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          // sameSite: "None",
          secure: true,
          maxAge: 6 * 60 * 1000,
        });

        res.json({ role, accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handleRefreshToken };
