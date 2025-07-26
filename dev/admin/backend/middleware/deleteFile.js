const fs = require("fs");

exports.deleteFile = (file) => {
  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

exports.deleteFiles = (files) => {
  console.log("files in delete function ===========", files);

  if (files.mainImage) {
    files.mainImage.forEach((file) => this.deleteFile(file));
  }

  if (files.images) {
    files.images.forEach((file) => this.deleteFile(file));
  }
};
