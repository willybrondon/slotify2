const SalonRequest = require("../../models/saloonrequest.model");
const userModel = require("../../models/user.model");

exports.createSalonRequest = async (req, res) => {
  console.log("req.body", req.body);

  const { name, email, address, mobile, about, expertCount, userId } = req.body;
  const image = process?.env?.baseURL + req?.file?.path;

  try {
    if (!name || !email || !address || !mobile || !about || !expertCount || !req.file) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    let user;
    if (userId) {
      user = await userModel.findById(userId);
      if (user) {
        user.salonRequestSent = true;
        await user.save();
      }
    }

    const existingSalonRequest = await SalonRequest.findOne({
      $or: [{ name: name }, { email: email }, { address: address }, { mobile: mobile }],
    });
    if (existingSalonRequest) {
      return res.status(200).send({ status: false, message: "Salon request already exists" });
    }

    const newSalonRequest = new SalonRequest({
      ...req.body,
      userId: user && user?._id,
      locationCoordinates: {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      },
      image: req.file ? process?.env?.baseURL + req?.file?.path : "",
    });

    await newSalonRequest.save();

    return res.status(200).send({
      status: true,
      message: "Salon request created successfully!",
      data: newSalonRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};
