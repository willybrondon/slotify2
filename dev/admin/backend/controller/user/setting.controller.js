const Setting = require("../../models/setting.model");

exports.get = async (req, res) => {
    try {
      const setting = await Setting.findOne().sort({ createdAt: -1 });
      if (!setting) {
        return res.status(200).send({
          status: false,
          message: "oops! setting Not Found!!",
        });
      }
      return res.status(200).send({
        status: true,
        message: "success!!",
        setting,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        error: error.message || "Internal Server Error!!",
      });
    }
  };