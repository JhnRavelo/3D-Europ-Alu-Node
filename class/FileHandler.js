const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
require("dotenv").config();

class FileHandler {
  constructor() {
    const date = new Date();
    this.dateArray = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  }

  getDate() {
    const date = new Date();
    return `${
      date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
    }`;
  }

  createDirectory(dirPath, index) {
    if (
      fs.existsSync(path.join(dirPath, `${this.dateArray[index]}`)) &&
      index < this.dateArray.length
    ) {
      return this.createDirectory(
        path.join(dirPath, `${this.dateArray[index]}`),
        index + 1
      );
    } else if (
      !fs.existsSync(path.join(dirPath, `${this.dateArray[index]}`)) &&
      index < this.dateArray.length
    ) {
      fs.mkdirSync(path.join(dirPath, `${this.dateArray[index]}`), {
        recursive: true,
      });
      return this.createDirectory(
        path.join(dirPath, `${this.dateArray[index]}`),
        index + 1
      );
    } else {
      return dirPath;
    }
  }

  readDirectory(exportPath, filesArray = []) {
    const files = fs.readdirSync(exportPath);
    files.forEach((file) => {
      const filePath = path.join(exportPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.readDirectory(filePath, filesArray);
      } else {
        filesArray.push(filePath);
      }
    });
    return filesArray;
  }

  createFile(fileName, data, ext, filePath, type) {
    let name = Buffer.from(
        fileName
          .slice(0, 30)
          .replace(/,/g, "")
          .replace(/public/g, ""),
        "latin1"
      ).toString("utf8"),
      fileDir,
      location;
    const date = `-${this.getDate()}.`;

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    if (type == "tmpApp") {
      name = name + "." + ext;
      fileDir = filePath;
      location = path.join(filePath, name);
    } else {
      name = name + date + ext;
      fileDir = this.createDirectory(filePath, 0);
      location = path.join(fileDir, name);

      if (type == "public") {
        const publicPath = path.join(fileDir, name).split("public")[1];
        location = `${process.env.SERVER_PATH}${publicPath.replace(
          /\\/g,
          "/"
        )}`;
      }
    }
    fs.writeFileSync(path.join(fileDir, name), data, {
      encoding: "utf8",
      flag: "w",
    });
    return { fileDir, location, date };
  }

  async createImage(files, imgPath, ext, type) {
    const galleryArray = new Array();
    const response = files.map(async (file) => {
      if (file.mimetype.split("/")[0] == "image") {
        let webpData = file.buffer;

        if (ext == "webp") {
          webpData = await sharp(file.buffer).webp().toBuffer();
        }
        const { location } = this.createFile(
          file.originalname.split(".")[0],
          webpData,
          ext,
          imgPath,
          type
        );
        galleryArray.push(location);
      }
    });
    await Promise.all(response);
    return galleryArray.join(",");
  }

  deleteFileFromDatabase(deleted, dirPath, type) {
    const location =
      deleted.split(type).length > 2
        ? deleted.split(type).slice(1).join(type)
        : deleted.split(type)[1];
    const filePath = path.join(dirPath, location);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = FileHandler;
