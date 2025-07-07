const Complain = require("../../models/complain.model");
const Salon = require("../../models/salon.model");

exports.pendingSolvedComplains = async (req, res) => {
  try {
    const start = req.query.start || 0;
    const limit = req.query.limit || 10;
    const skipAmount = start * limit;

    const type = req.query.type;
    const person = req.query.person;
    let query = {};
    const salon = await Salon.findById(req?.salon?._id);
    if (!salon) {
      return res
        .status(200)
        .send({ status: false, message: "Salon not exist" });
    }

    if (type == 0 && person == 0) {
      query = { type: 0, person: 0, salonId: salon._id };
    } else if (type == 1 && person == 0) {
      query = { type: 1, person: 0, salonId: salon._id };
    } else if (type == 2 && person == 0) {
      query = { person: 0, salonId: salon._id };
    } else if (type == 0 && person == 1) {
      query = { type: 0, person: 1, salonId: salon._id };
    } else if (type == 1 && person == 1) {
      query = { type: 1, person: 1, salonId: salon._id };
    } else if (type == 2 && person == 1) {
      query = { person: 1, salonId: salon._id };
    }

    const [result,total]  = await Promise.all([
      Complain.find(query).populate("expertId userId bookingData")
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .exec(),
      Complain.countDocuments(query),
    ])



    return res
      .status(200)
      .send({ status: true, message: "success", total, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
