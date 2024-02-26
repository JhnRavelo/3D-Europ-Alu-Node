const { users, sessions, logs } = require("../database/models");
const bcrypt = require("bcrypt");
require("dotenv").config();
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const contByMonth = require("../utils/countByMonth");

var date = new Date();
var day = date.getDate();
var month = date.getMonth() + 1;
var year = date.getFullYear();

const userRegistration = async (req, res) => {
  try {
    const { name, email, phone, password, typeUser } = await req.body;
    var userName;
    if (email) {
      userName = await users.findOne({
        where: {
          email: email,
        },
      });
    }

    if (userName) {
      res.json(`L'utilisateur existe déjà`);
    } else if (name && email && !userName && phone && password && typeUser) {
      const userRegister = await users.create({
        name,
        email,
        phone,
        password: await bcrypt.hash(password, 10),
        type: typeUser,
      });

      const id = userRegister.ID_user,
        role = userRegister.role,
        refreshToken = users.prototype.generateRefreshToken(id),
        accessToken = users.prototype.generateToken(id, role);

      userRegister.refreshToken = refreshToken;

      const result = await userRegister.save();

      if (!result) return res.json("Utilisateur non enregistré");

      if (userRegister.role == process.env.PRIME3) {
        await sessions.create({
          userId: userRegister.ID_user,
          day,
          month,
          year,
        });

        await logs.create({
          userId: userRegister.ID_user,
        });
      }

      res.cookie("jwt", refreshToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        // sameSite: "None",
        secure: true,
      });

      res.json({ role, accessToken });
    } else {
      res.json("Suivant");
    }
  } catch (error) {
    console.log(error);
  }
};

const userLogin = async (req, res) => {
  try {
    const { loginMail, loginPassword } = await req.body;

    const cookie = req.cookies;

    const userName = await users.findOne({
      where: {
        email: {
          [Op.eq]: loginMail,
        },
      },
    });

    if (!userName) {
      return res.json({
        success: false,
        message: "L'utilisateur n'est pas enregistré",
      });
    }

    const match = await bcrypt.compare(loginPassword, userName.password);

    if (!match) {
      return res.json({ success: false, message: "Connexion invalide" });
    }
    const id = userName.ID_user;
    const role = userName.role;

    let newRefreshToken = users.prototype.generateRefreshToken(id);
    const accessToken = users.prototype.generateToken(id, role);

    if (cookie?.jwt) {
      const refreshToken = cookie.jwt;
      const foundUser = await users.findOne({
        where: {
          refreshToken: refreshToken,
        },
      });

      if (foundUser) {
        newRefreshToken = "";
        res.clearCookie("jwt", {
          httpOnly: true,
          // sameSite: "None",
          secure: true,
        });
      }
    }

    userName.refreshToken = newRefreshToken;

    await userName.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      // sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    if (userName.role == process.env.PRIME3) {
      await sessions.create({
        userId: userName.ID_user,
        day,
        month,
        year,
      });
    }

    res.json({ role, accessToken });
  } catch (error) {
    console.log(error);
  }
};

const userRead = async (req, res) => {
  try {
    const cookie = await req.cookies;
    if (!cookie?.jwt) return res.sendStatus(401);
    const refreshToken = cookie.jwt;

    const user = await users.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) return res.sendStatus(401);

    res.json({
      id: user.ID_user,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    });
  } catch (error) {
    console.log(error);
  }
};

const userLogout = async (req, res) => {
  try {
    const cookie = req.cookies;

    if (!cookie?.jwt) return res.sendStatus(204);

    const refreshToken = cookie.jwt;

    const user = await users.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        // sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }
    console.log("vider");
    user.refreshToken = "";
    await user.save();

    res.clearCookie("jwt", {
      httpOnly: true,
      // sameSite: "None",
      secure: true,
    });

    return res.json("SUCCESS");
  } catch (error) {
    console.log(error);
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, phone, password, type, role } = await req.body;
    var userName;

    if (email) {
      userName = await users.findOne({
        where: {
          email: email,
        },
      });
    }

    if (userName) {
      return res.json(`L'utilisateur existe déjà`);
    } else if (name && email && phone && password) {
      const userAdd = await users.create({
        name,
        email,
        phone,
        password: await bcrypt.hash(password, 10),
      });

      if (type) {
        userAdd.type = type;
      }
      if (role) {
        userAdd.role = role;
      }

      const result = await userAdd.save();

      console.log(result);

      if (result) {
        if (userAdd.role == process.env.PRIME3) {
          await sessions.create({ userId: userAdd.ID_user, day, month, year });
        }
        res.json(`Utilisateur ajouté`);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const uploadUserImage = async (req, res) => {
  try {
    let avatar, userUpload;
    const { id, email } = req.body;

    if (id) {
      userUpload = await users.findOne({
        where: {
          ID_user: id,
        },
      });
    } else if (!id && email) {
      userUpload = await users.findOne({
        where: {
          email: email,
        },
      });
    } else {
      return res.json("Aucun");
    }

    if (!userUpload) return res.json("Non trouvé");

    if (req?.files?.avatar) {
      if (req.files.avatar[0].mimetype.split("/")[0] == "image") {
        avatar = `/img/avatar/${req.files.avatar[0].filename}`;
      }
    }

    if (avatar) userUpload.avatar = avatar;

    const result = await userUpload.save();

    if (result) {
      res.json("Upload product");
    }
  } catch (error) {
    console.log(error);
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await users.findAll({
      where: {
        role: process.env.PRIME3,
      },
    });

    const filterResult = result.map((item) => {
      if (item.refreshToken) {
        return {
          ID_user: item.ID_user,
          name: item.name,
          email: item.email,
          phone: item.phone,
          avatar: item.avatar,
          createdAt: item.createdAt,
          connected: true,
          type: item.type,
        };
      } else {
        return {
          ID_user: item.ID_user,
          name: item.name,
          email: item.email,
          phone: item.phone,
          avatar: item.avatar,
          createdAt: item.createdAt,
          connected: false,
          type: item.type,
        };
      }
    });

    res.json(filterResult);
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, updateEmail, phone, updatePassword, type, id, role } =
      await req.body;

    if (!id) return res.json("Sans id");

    const user = await users.findOne({ where: { ID_user: id } });

    if (!user) return res.json("Sans user");

    if (name) user.name = name;
    if (updateEmail) user.email = updateEmail;
    if (phone) user.phone = phone;
    if (type) {
      user.type = type;
    }

    if (role) {
      user.role = role;
    }

    if (updatePassword) {
      user.password = await bcrypt.hash(updatePassword, 10);
    }
    const result = await user.save();

    if (result) return res.json("Utilisateur modifié");
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, id } = await req.body;
    const user = await users.findOne({ where: { ID_user: id } });
    if (name) user.name = name;

    const result = await user.save();

    if (result) return res.json("Utilisateur modifié");
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req?.params?.id) {
      const id = await req.params.id;
      const user = await users.findOne({
        where: {
          ID_user: id,
        },
      });
      const result = await user.destroy();
      if (result) return res.json("supprimé");
    } else res.json("non supprimé");
  } catch (error) {
    console.log(error);
  }
};

const getCommercials = async (req, res) => {
  try {
    const result = await users.findAll({
      where: {
        role: process.env.PRIME2,
      },
    });

    const filterResult = result.map((item) => {
      if (item.refreshToken) {
        return {
          ID_user: item.ID_user,
          name: item.name,
          email: item.email,
          phone: item.phone,
          avatar: item.avatar,
          createdAt: item.createdAt,
          connected: true,
        };
      } else {
        return {
          ID_user: item.ID_user,
          name: item.name,
          email: item.email,
          phone: item.phone,
          avatar: item.avatar,
          createdAt: item.createdAt,
          connected: false,
        };
      }
    });

    return res.json(filterResult);
  } catch (error) {
    console.log(error);
  }
};

const avatarUpdateUser = async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await users.findOne({
      where: {
        ID_user: req.user,
      },
    });
    user.avatar = avatar;
    const result = await user.save();

    if (result) {
      return res.json("Avatar");
    } else return res.json("Non");
  } catch (error) {
    console.log(error);
  }
};

const nbrUser = async (req, res) => {
  try {
    const { year } = await req.body;

    const countUser = await users.findAll({
      where: {
        role: process.env.PRIME3,
      },
      attributes: [
        [sequelize.literal("YEAR(createdAt)"), "year"],
        [sequelize.literal("MONTH(createdAt)"), "month"],
      ],
    });

    const UserByYear = countUser.filter((result) => {
      return result.dataValues.year == year;
    });

    const countUserByYear = {
      userCount: UserByYear.length + 1,
    };

    const userCountsByMonth = {};

    UserByYear.forEach((user) => {
      const month = user.getDataValue("month");

      const key = `${month}`;
      if (userCountsByMonth[key]) {
        userCountsByMonth[key]++;
      } else {
        userCountsByMonth[key] = 1;
      }
    });

    // Étape 3 : Générez un tableau d'objets avec les résultats.
    const userCountsArray = [];

    for (const key in userCountsByMonth) {
      if (userCountsByMonth.hasOwnProperty(key)) {
        userCountsArray.push({
          month: key,
          count: userCountsByMonth[key],
        });
      }
    }

    // Triez le tableau par mois (facultatif)
    userCountsArray.sort((a, b) => {
      return a.month - b.month;
    });

    const countByMonthByYear = userCountsArray;

    const userVisit = await sessions.findAll({
      where: {
        year: year,
      },
      attributes: ["month"],
    });

    const userVisitByMonth = contByMonth(userVisit, "month");

    res.json({ countUserByYear, countByMonthByYear, userVisitByMonth });
    console.log(countUserByYear);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userRegistration,
  userLogin,
  userLogout,
  userRead,
  addUser,
  getUsers,
  updateUser,
  deleteUser,
  getCommercials,
  validationLogin,
  validationRegister,
  uploadUserImage,
  avatarUpdateUser,
  updateProfile,
  nbrUser,
};
