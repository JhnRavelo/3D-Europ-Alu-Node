const FileHandler = require("../class/FileHandler");
const { messages, users } = require("../database/models");
const { Op, Sequelize } = require("sequelize");
require("dotenv").config();
const path = require("path");
const deleteFileFromMessage = require("../utils/deleteFileFromMessage");

const photoPath = path.join(
  __dirname,
  "..",
  "public",
  "dist",
  "img",
  "message",
  "photo"
);
const filePath = path.join(
  __dirname,
  "..",
  "public",
  "dist",
  "img",
  "message",
  "file"
);
const imgPath = path.join(__dirname, "..", "public", "dist", "img", "file");

const addMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = await req.body;

    if (!sender || !receiver) return res.sendStatus(401);

    if (!req?.files?.img && !req?.files?.file && !text)
      return res.sendStatus(401);
    let imgs, files;
    const fileHandler = new FileHandler();

    if (req?.files?.img) {
      imgs = await fileHandler.createImage(
        req?.files.img,
        photoPath,
        "webp",
        "public"
      );
    }

    if (req?.files?.file) {
      const filesArray = req?.files?.file.map((file) => {
        const fileName = file.originalname.split(".")[0];
        const ext =
          file.originalname.split(".")[file.originalname.split(".").length - 1];
        const { location } = fileHandler.createFile(
          fileName,
          file.buffer,
          ext,
          filePath,
          "public"
        );
        return location;
      });
      files = filesArray.join(",");
    }
    const addedMessage = await messages.create({
      sender,
      receiver,
      text,
      img: imgs ? imgs : "",
      file: files ? files : "",
    });

    if (!addedMessage) return res.sendStatus(401);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR ADD MESSAGE", error);
  }
};

const getMessage = async (req, res) => {
  try {
    const { receiver } = await req.body;

    if (!receiver) return res.sendStatus(403);
    const getMessages = await messages.findAll({
      where: {
        [Op.or]: [
          {
            sender: req.user,
            receiver: receiver,
          },
          {
            sender: receiver,
            receiver: req.user,
          },
        ],
      },
      include: [
        {
          model: users,
          as: "send",
          attributes: ["name", "avatar", "ID_user"],
        },
        {
          model: users,
          as: "receive",
          attributes: ["name", "avatar", "ID_user"],
        },
      ],
      attributes: [
        [Sequelize.literal("DATE(messages.createdAt)"), "date"],
        [Sequelize.literal("TIME(messages.createdAt)"), "time"],
        "text",
        "img",
        "file",
        "ID_message",
      ],
      order: [[Sequelize.col("messages.createdAt"), "ASC"]],
    });

    if (!getMessages) return res.sendStatus(401);
    await messages.update(
      { unRead: false },
      {
        where: {
          unRead: true,
          sender: receiver,
        },
      }
    );
    res.json(getMessages);
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR GET MESSAGE", error);
  }
};

const getLastMessage = async (req, res) => {
  try {
    const lastMessages = await messages.findAll({
      where: {
        [Op.or]: [{ sender: req.user }, { receiver: req.user }],
      },
      include: [
        {
          model: users,
          as: "send",
          attributes: ["name", "avatar", "ID_user"],
        },
        {
          model: users,
          as: "receive",
          attributes: ["name", "avatar", "ID_user"],
        },
      ],
      order: [[Sequelize.col("messages.createdAt"), "DESC"]],
    });

    if (!lastMessages) return res.sendStatus(401);
    res.json(lastMessages);
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR GET LAST MESSAGE", error);
  }
};

const getUsers = async (req, res) => {
  try {
    const user = await messages.findAll({
      where: {
        [Op.or]: [{ sender: req.user }, { receiver: req.user }],
      },
      include: [
        {
          model: users,
          as: "send",
          attributes: ["name", "avatar", "ID_user"],
        },
        {
          model: users,
          as: "receive",
          attributes: ["name", "avatar", "ID_user"],
        },
      ],
      order: [[Sequelize.col("messages.createdAt"), "DESC"]],
    });

    if (!user) return res.sendStatus(401);
    const allUserAvecDoublons = user.map((item) => {
      if (item.send.ID_user == req.user) {
        return {
          ID_user: item.receive.ID_user,
          avatar: item.receive.avatar,
          name: item.receive.name,
        };
      } else {
        return {
          ID_user: item.send.ID_user,
          avatar: item.send.avatar,
          name: item.send.name,
        };
      }
    });
    const allUser = [];
    const objetsUniques = new Set();

    allUserAvecDoublons.forEach((objet) => {
      const cleObjet = `${objet.ID_user}`;

      if (!objetsUniques.has(cleObjet)) {
        objetsUniques.add(cleObjet);
        allUser.push(objet);
      }
    });

    if (!allUser) return res.sendStatus(401);
    res.json(allUser);
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR GET USERS", error);
  }
};

const getMessageNotif = async (req, res) => {
  try {
    const receiveMessage = await messages.findAll({
      where: {
        unRead: true,
        receiver: req.user,
      },
      attributes: [
        "sender",
        "receiver",
        "createdAt",
        [Sequelize.fn("COUNT", Sequelize.col("sender")), "count"],
      ],
      include: [
        {
          model: users,
          as: "send",
          attributes: ["ID_user", "name", "email"],
        },
      ],
      group: ["sender"],
      order: [[Sequelize.col("messages.createdAt"), "DESC"]],
    });

    if (!receiveMessage) return res.sendStatus(401);
    res.json(receiveMessage);
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR GET MESSAGE NOTIFICATION", error);
  }
};

const downloadFileMessage = async (req, res) => {
  try {
    const { file } = await req.body;

    if (!file) return res.sendStatus(401);

    if (file.includes("message/file/")) {
      res.download(path.join(filePath, file.split("message/file/")[1]));
    } else if (file.includes("message/photo/")) {
      res.download(path.join(photoPath, file.split("message/photo/")[1]));
    } else if (file.includes("img/file/")) {
      res.download(path.join(imgPath, file.split("/file/")[1]));
    }
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR DOWNLOAD FILE IN MESSAGE", error);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id, file } = req.body;

    if (!id) return res.sendStatus(401);
    const deletedMessage = await messages.findOne({
      where: { ID_message: id },
    });

    if (!deletedMessage) return res.sendStatus(401);
    let result;
    const fileHandler = new FileHandler();

    if (file && file?.includes("message/file/") && deletedMessage?.file) {
      fileHandler.deleteFileFromDatabase(file, filePath, "message/file/");
      result = await deleteFileFromMessage(file, deletedMessage, "file");
    } else if (
      file &&
      (file?.includes("message/photo/") || file?.includes("img/file/")) &&
      deletedMessage?.img
    ) {
      if (file?.includes("message/photo/")) {
        fileHandler.deleteFileFromDatabase(file, photoPath, "message/photo/");
      } else {
        fileHandler.deleteFileFromDatabase(file, imgPath, "img/file/");
      }
      result = await deleteFileFromMessage(file, deletedMessage, "img");
    } else result = await deletedMessage.destroy();

    if (!result) return res.sendStatus(401);
    res.json("message supprimé");
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR DELETE MESSAGE", error);
  }
};

module.exports = {
  addMessage,
  getMessage,
  getLastMessage,
  getUsers,
  getMessageNotif,
  downloadFileMessage,
  deleteMessage,
};
