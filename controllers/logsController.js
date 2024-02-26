const { logs, users, trakers, products } = require("../database/models");
const { Op, Sequelize } = require("sequelize");

const getLogs = async (req, res) => {
  try {
    const { year } = req.body;

    const unReadLogNb = await logs.findAll({
      where: {
        unRead: true,
      },
      attributes: [[Sequelize.fn("COUNT", Sequelize.col("ID_log")), "count"]],
    });

    const userCreated = await logs.findAll({
      where: {
        userId: {
          [Op.ne]: null,
        },
        unRead: true,
      },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("ID_log")), "count"],
        [Sequelize.literal("YEAR(logs.createdAt)"), "year"],
      ],
    });

    const list = await logs.findAll({
      attributes: [
        [Sequelize.literal("YEAR(logs.createdAt)"), "year"],
        [Sequelize.literal("DATE(logs.createdAt)"), "date"],
        [Sequelize.literal("TIME(logs.createdAt)"), "time"],
      ],
      include: [
        {
          model: users,
          attributes: ["name", "email"],
        },
        {
          model: trakers,
          include: [
            {
              model: products,
              attributes: ["title"],
            },
            {
              model: users,
              attributes: ["name", "email"],
            },
          ],
        },
      ],
      order: [[Sequelize.col("logs.createdAt"), "DESC"]],
    });

    const listProductInterested = await logs.findAll({
      where: {
        unRead: true,
      },
      attributes: [
        [Sequelize.literal("YEAR(logs.createdAt)"), "year"],
        [Sequelize.literal("DATE(logs.createdAt)"), "date"],
        [Sequelize.literal("TIME(logs.createdAt)"), "time"],
      ],
      include: [
        {
          model: users,
          attributes: ["name", "email"],
        },
        {
          model: trakers,
          include: [
            {
              model: products,
              attributes: ["title"],
            },
            {
              model: users,
              attributes: ["name", "email"],
            },
          ],
        },
      ],
      order: [[Sequelize.col("logs.createdAt"), "ASC"]],
    });

    const productInterested = await logs.findAll({
      where: {
        trakerId: {
          [Op.ne]: null,
        },
        unRead: true,
      },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("ID_log")), "count"],
        [Sequelize.literal("YEAR(logs.createdAt)"), "year"],
      ],
    });

    const userCreatedByYear = userCreated.filter((result) => {
      return result.dataValues.year == year;
    });
    const productInterestedByYear = productInterested.filter((result) => {
      return result.dataValues.year == year;
    });
    const listByYear = list.filter((result) => {
      return result.dataValues.year == year;
    });
    const listProductInterestedByYear = listProductInterested.filter(
      (result) => {
        return result.dataValues.year == year;
      }
    );

    res.json({
      unReadLogNb,
      userCreatedByYear,
      productInterestedByYear,
      listProductInterestedByYear,
      listByYear,
    });
  } catch (error) {
    console.log(error);
  }
};

const readLogs = async (req, res) => {
  try {
    const logRead = await logs.update(
      { unRead: false },
      {
        where: {
          unRead: true,
        },
      }
    );
    if (logRead) {
      res.json("Update");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getLogs, readLogs };
