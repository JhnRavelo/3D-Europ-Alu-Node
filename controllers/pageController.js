const { pages } = require("../database/models");
require("dotenv").config();

const addPage = async (req, res) => {
  try {
    const { page, position, minYAngle, maxYAngle, minXAngle, maxXAngle } =
      await req.body;

    const addPage = await pages.findOne({
      where: {
        page: page,
      },
    });
    if (addPage) return res.json("Page existe déjà");

    if (
      /^[A-Za-z]+$/.test(page) ||
      /^(-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?)$/.test(position) ||
      /^-?\d+(\.\d+)?$/.test(minXAngle) ||
      /^-?\d+(\.\d+)?$/.test(minYAngle) ||
      /^-?\d+(\.\d+)?$/.test(maxXAngle) ||
      /^-?\d+(\.\d+)?$/.test(maxYAngle)
    ) {
      return res.sendStatus(401);
    }

    const result = await pages.create({
      page,
      position,
      minYAngle,
      maxYAngle,
      minXAngle,
      maxXAngle,
    });

    if (result) {
      return res.json("Page ajouté");
    }
  } catch (error) {
    console.log(error);
  }
};

const uploadPageImage = async (req, res) => {
  try {
    let icon, home, pageUpload;
    const { id, page } = req.body;

    if (id) {
      pageUpload = await pages.findOne({
        where: {
          ID_page: id,
        },
      });
    } else if (!id && page) {
      pageUpload = await pages.findOne({
        where: {
          page: page,
        },
      });
    } else {
      res.json("Aucun");
    }

    if (!pageUpload) return res.json("Non trouvé");

    if (req?.files?.icon) {
      if (req.files.icon[0].mimetype.split("/")[0] == "image") {
        icon = `/img/icon/${req.files.icon[0].filename}`;
      }
    }
    if (req?.files?.home) {
      if (req.files.home[0].mimetype.split("/")[0] == "image") {
        home = `/img/home/${req.files.home[0].filename}`;
      }
    }

    if (icon) pageUpload.icon = icon;
    if (home) pageUpload.home = home;

    const result = await pageUpload.save();

    if (result) {
      res.json("Upload product");
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePage = async (req, res) => {
  try {
    const { id, page, position, minYAngle, maxYAngle, minXAngle, maxXAngle } =
      await req.body;
    if (id) {
      const updatePage = await pages.findOne({
        where: {
          ID_page: id,
        },
      });

      if (!updatePage) {
        return res.json(`La table n'existe pas`);
      } else {
        if (
          page &&
          position &&
          minXAngle &&
          maxXAngle &&
          minYAngle &&
          maxYAngle
        ) {
          updatePage.set({
            page,
            position,
            minXAngle,
            minYAngle,
            maxXAngle,
            maxYAngle,
          });
        }

        const result = await updatePage.save();
        if (result) {
          res.json("Page modifié");
        }
      }
    } else res.json("Page non modifié");
  } catch (error) {
    console.log(error);
  }
};

const getPages = async (req, res) => {
  try {
    const result = await pages.findAll();
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};

const deletePage = async (req, res) => {
  try {
    const id = await req?.params?.id;
    if (!id) return res.json("Pas d'identifiant");

    const page = await pages.findOne({
      where: {
        ID_page: id,
      },
    });

    if (!page) return res.json("Page n'existe pas");

    const result = await page.destroy();

    if (result) return res.json("supprimé");

    res.json("non supprimé");
  } catch (error) {
    console.log(error);
  }
};

const getPage = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await pages.findOne({
      where: {
        ID_page: id,
      },
    });

    res.json(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addPage,
  updatePage,
  getPages,
  deletePage,
  uploadPageImage,
  getPage,
};
