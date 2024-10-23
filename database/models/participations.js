module.exports = (sequelize, DataTypes) => {
  const participations = sequelize.define("participations", {
    ID_participation: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
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
    prize: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  return participations;
};
