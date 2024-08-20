const path = require("path");

module.exports = async (file, deletedMessage, data) => {
  let result;
  const files = deletedMessage[data].split(",");
  const deletedFiles = files.filter((item) => item != file);

  if (deletedFiles && deletedFiles?.length > 0) {
    deletedMessage[data] = deletedFiles.join(",");
    result = await deletedMessage.save();
  } else if (
    (!deletedFiles || deletedFiles?.length == 0) &&
    deletedMessage?.text
  ) {
    deletedMessage[data] = "";
    result = await deletedMessage.save();
  } else {
    result = await deletedMessage.destroy();
  }

  return result;
};
