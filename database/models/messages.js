module.exports = (sequelize, DataTypes) => {
  const messages = sequelize.define("messages", {
    ID_message: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    img: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  });

  messages.associate = (models) => {
    messages.belongsTo(models.users, {
      onDelete: "CASCADE",
      foreignKey: "sender",
      as: "send",
    });
    messages.belongsTo(models.users, {
      onDelete: "CASCADE",
      foreignKey: "receiver",
      as: "receive",
    });
  };

  return messages;
};
