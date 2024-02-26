module.exports = (sequelize, DataTypes) => {
  const pages = sequelize.define("pages", {
    ID_page: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    page: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minYAngle: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxYAngle: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    minXAngle: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxXAngle: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  pages.associate = (models) => {
    pages.hasMany(models.products, {
      onDelete: "CASCADE",
      foreignKey: "pageId",
    });
  };

  return pages;
};
