const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define("users", {
    ID_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "/avatar/User-avatar.png",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: process.env.PRIME3,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  users.prototype.generateToken = function (id, role) {
    const accessToken = jwt.sign(
      {
        userInfo: {
          id: id,
          role: role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "3600s",
      }
    );
    return accessToken;
  };

  users.prototype.generateRefreshToken = function (id) {
    const refreshToken = jwt.sign(
      {
        id: id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return refreshToken;
  };

  users.associate = (models) => {
    users.hasMany(models.trakers, {
      onDelete: "CASCADE",
      foreignKey: "userId",
    });

    users.hasMany(models.logs, {
      onDelete: "CASCADE",
      foreignKey: "userId",
    });

    users.hasMany(models.messages, {
      onDelete: "CASCADE",
      foreignKey: "sender",
    });
    users.hasMany(models.messages, {
      onDelete: "CASCADE",
      foreignKey: "receiver",
    });
  };

  return users;
};
