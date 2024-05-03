const {
  trakers,
  users,
  products,
  pages,
  logs,
  sessions,
} = require("../database/models");
const sequelize = require("sequelize");

const addTraker = async (req, res) => {
  try {
    const { checked } = await req.body;
    const { ID_user } = req.user;
    let response, isTraker;

    if (!checked && checked[0] == "") return res.json({ success: false });
    checked.map(async (track) => {
      var date = new Date();
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      const product = await products.findOne({
        where: {
          title: track,
        },
      });

      isTraker = await trakers.findOne({
        where: {
          userId: ID_user,
          productId: product.ID_product,
        },
      });

      if (!isTraker) {
        response = await trakers.create({
          date,
          day,
          month,
          year,
          userId: ID_user,
          productId: product.ID_product,
        });

        await logs.create({
          trakerId: response.id,
        });
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.log("ERROR ADD TRACKER", error);
  }
};

const getTraker = async (req, res) => {
  try {
    const traker = await trakers.findAll({
      where: {
        userId: req.user,
      },
      include: [
        {
          model: products,
          attributes: ["title", "png"],
        },
      ],
    });

    res.json(traker);
  } catch (error) {
    console.log("ERROR GET TRACKER", error);
  }
};

const getTrakers = async (req, res) => {
  try {
    const allTrakers = await trakers.findAll({
      include: [
        {
          model: products,
          attributes: ["title"],
          include: [
            {
              model: pages,
              attributes: ["page"],
            },
          ],
        },
        {
          model: users,
          attributes: ["name", "email", "phone"],
        },
      ],
    });

    res.json(allTrakers);
  } catch (error) {
    console.log("ERROR GET TRACKER", error);
  }
};

const getTopProduct = async (req, res) => {
  try {
    const { year } = req.body;

    const topProduct = await trakers.findAll({
      where: {
        year: year,
      },
      include: [
        {
          model: products,
          attributes: ["title", "png"],
          include: {
            model: pages,
            attributes: ["page"],
          },
        },
      ],
      attributes: [
        "productId",
        [sequelize.fn("COUNT", sequelize.col("productId")), "count"],
      ],
      group: ["productId"],
      order: [[sequelize.fn("COUNT", sequelize.col("productId")), "DESC"]],
      limit: 5,
    });

    res.json(topProduct);
  } catch (error) {
    console.log("ERROR GET TOP PRODUCT", error);
  }
};

const nbrProdByTrack = async (req, res) => {
  try {
    const { year } = req.body;

    const countProdInterested = await trakers.findAll({
      where: {
        year: year,
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("productId")), "prodCount"],
      ],
    });

    const countByMonthByYear = await trakers.findAll({
      where: {
        year: year,
      },
      attributes: [
        "month",
        [sequelize.fn("COUNT", sequelize.col("ProductId")), "count"],
      ],
      group: ["month"],
      order: ["month"],
    });

    const countProductByPageByMonth = await products.findAll({
      include: [
        {
          model: trakers,
          where: {
            year: year,
          },
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("pageId")), "Cacount"],
          ],
        },
        {
          model: pages,
          attributes: ["page"],
        },
      ],
      group: ["pageId"],
      order: ["pageId"],
    });

    const years = await sessions.findAll({
      attributes: ["year"],
      group: ["year"],
      order: ["year"],
      limit: 5,
    });

    res.json({
      countProdInterested,
      countByMonthByYear,
      countProductByPageByMonth,
      years,
    });
  } catch (error) {
    console.log("ERROR NBR PROD BY TRACK", error);
  }
};

const getProdByInterested = async (req, res) => {
  try {
    const { id, year } = req.body;

    const countByMonthByYear = await trakers.findAll({
      where: {
        year: year,
        productId: id,
      },
      attributes: [
        "month",
        [sequelize.fn("COUNT", sequelize.col("ProductId")), "count"],
      ],
      group: ["month"],
      order: ["month"],
    });

    const logSingleProductInterested = await trakers.findAll({
      where: {
        year: year,
        productId: id,
      },
      attributes: [
        "date",
        [sequelize.literal("TIME(trakers.createdAt)"), "time"],
      ],
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
      order: [[sequelize.col("trakers.createdAt"), "DESC"]],
      limit: 10,
    });

    res.json({ countByMonthByYear, logSingleProductInterested });
  } catch (error) {
    console.log("ERROR GET PROD BY INTERESTED", error);
  }
};

module.exports = {
  addTraker,
  getTraker,
  getTrakers,
  getTopProduct,
  nbrProdByTrack,
  getProdByInterested,
};
