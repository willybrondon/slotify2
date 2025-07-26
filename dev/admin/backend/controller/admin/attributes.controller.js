const Attributes = require("../../models/attributes.model");

//create attributes
exports.store = async (req, res) => {
  try {
    if (!req.body.name || !req.body.value) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const existAttribute = await Attributes.findOne({ name: req.body.name.trim() });
    if (existAttribute) {
      return res.status(200).json({ status: false, message: "Attributes with that name already exist." });
    }

    const attributes = new Attributes();

    attributes.name = req.body.name;

    //value
    const multiplevalue = req.body.value.toString().split(",");
    attributes.value = multiplevalue;

    await attributes.save();

    return res.status(200).json({
      status: true,
      message: "attributes Created Successfully.",
      attributes: attributes,
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//update attributes
exports.update = async (req, res) => {
  try {
    const attributes = await Attributes.findById(req.query.attributesId);
    if (!attributes) {
      return res.status(200).json({ status: false, message: "attributes does not found." });
    }

    attributes.name = req.body.name ? req.body.name : attributes.name;

    //value
    const multiplevalue = req.body.value ? req.body.value.toString().split(",") : attributes.value;
    attributes.value = multiplevalue;

    await attributes.save();

    return res.status(200).json({
      status: true,
      message: "attributes updated Successfully.",
      attributes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get attributes
exports.get = async (req, res) => {
  try {
    const attributes = await Attributes.find().sort({ createdAt: 1 }).lean();

    return res.status(200).json({ status: true, message: "Success", attributes });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//delete attributes
exports.destroy = async (req, res) => {
  try {
    const attributes = await Attributes.findById(req.query.attributesId);
    if (!attributes) {
      return res.status(200).json({ status: false, message: "attributes does not found." });
    }

    await attributes.deleteOne();

    return res.status(200).json({ status: true, message: "attributes deleted Successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};
