module.exports = (sequelize, DataTypes) => {
  const prizes = sequelize.define("prizes", {
    ID_prize: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    prize: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rest: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return prizes;
};
