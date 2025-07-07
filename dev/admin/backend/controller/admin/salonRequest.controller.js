const Saloonrequest = require("../../models/saloonrequest.model");

exports.getAllSalonRequest = async (req, res) => {
  try {
    const findSalonData = await Saloonrequest.find()
      .populate("userId", "fname lname image")
      .sort({ createdAt: -1 });

    console.log("findSalonData", findSalonData);

    return res.status(200).send({
      status: true,
      message: "Salon Request Fetch Succesfully",
      data: findSalonData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error?.message });
  }
};

exports.deleteSalonRequest = async (req, res) => {
  const deleteSalonRequestId = req?.query?.deleteSalonRequestId;

  console.log("deleteSalonRequestId", deleteSalonRequestId);

  try {
    if (!deleteSalonRequestId) {
      return res.status(200).send({ status: false, message: "ID is required" });
    }

    const salonRequest = await Saloonrequest.findById(deleteSalonRequestId);

    if (!salonRequest) {
      return res.status(200).send({
        status: false,
        message: "Request Does Not Found",
      });
    }

    await salonRequest.deleteOne();
    return res.status(200).send({
      status: true,
      message: "Salon request deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" });
  }
};
