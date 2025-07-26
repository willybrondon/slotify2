const UserWalletHistory = require("./models/userWalletHistory.model");
const SalonExpertWalletHistory = require("./models/salonExpertWalletHistory.model");
const WithdrawRequest = require("./models/withdrawRequest.model");

async function generateUniqueIdentifier() {
  const length = 9;
  let uniqueId;
  let exists = true;

  while (exists) {
    uniqueId =
      "#" +
      Math.random()
        .toString(36)
        .substring(2, 2 + length)
        .toUpperCase();

    exists =
      (await UserWalletHistory.findOne({ uniqueId: uniqueId }).lean()) ||
      (await SalonExpertWalletHistory.findOne({ uniqueId: uniqueId }).lean()) ||
      (await WithdrawRequest.findOne({ uniqueId: uniqueId }).lean());
  }

  return uniqueId;
}

module.exports = { generateUniqueIdentifier };
