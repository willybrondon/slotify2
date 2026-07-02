// Salon withdrawal requests are no longer processed from the admin panel.

exports.retriveSalonWithdRequest = async (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Les demandes de retrait salon ne sont plus gérées depuis l'admin.",
    total: 0,
    request: [],
  });
};

exports.withdrawRequestApproved = async (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Les demandes de retrait salon ne sont plus gérées depuis l'admin.",
  });
};

exports.withdrawRequestRejected = async (req, res) => {
  return res.status(200).json({
    status: false,
    message: "Les demandes de retrait salon ne sont plus gérées depuis l'admin.",
  });
};
