const Attributes = require("../../models/attributes.model");
const Salon = require("../../models/salon.model");

exports.store = async (req, res) => {
  try {
    if (!req.body.name || !req.body.value) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const salonId = req.salon._id;

    const [salon, existAttribute] = await Promise.all([Salon.findById(salonId), Attributes.findOne({ name: req.body.name.trim() })]);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    if (existAttribute) {
      return res.status(200).json({ status: false, message: "Attributes with that name already exist." });
    }

    const attributes = new Attributes();

    attributes.salonId = salonId;
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

exports.update = async (req, res) => {
  try {
    const salonId = req.salon._id;

    const [salon, attributes] = await Promise.all([Salon.findById(salonId), Attributes.findOne({ _id: req.query.attributesId, salonId: salonId })]);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

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

exports.get = async (req, res) => {
  try {
    const salonId = req.salon._id;

    const [salon, attributes] = await Promise.all([Salon.findById(salonId), Attributes.find({ salonId: salonId }).sort({ createdAt: 1 }).lean()]);

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    return res.status(200).json({ status: true, message: "Success", attributes });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};
