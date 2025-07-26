const User = require("../../models/user.model");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");
const fs = require("fs");

const UserWalletHistory = require("../../models/userWalletHistory.model");
const Notification = require("../../models/notification.model");
const Coupon = require("../../models/coupon.model");

const admin = require("../../firebase");
const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");

const mongoose = require("mongoose");
const moment = require("moment");

const userFunction = async (user, data_) => {
  const data = data_.body;
  const file = data_.file;

  user.image = data.image ? data.image : !user.image && !file ? `${process?.env?.baseURL}storage/male.png` : file ? process?.env?.baseURL + file.path : user.image;

  user.uniqueId = user.uniqueId ? user.uniqueId : Math.floor(Math.random() * 1000000 + 999999);
  user.fname = data.fname ? data.fname.trim() : user?.fname;
  user.lname = data.lname ? data.lname.trim() : user?.lname;

  user.email = data.email ? data.email.trim() : user?.email;
  user.password = data?.password ? cryptr.encrypt(data?.password) : user?.password;

  user.loginType = data?.loginType ? data?.loginType : user.loginType;
  user.age = data?.age ? data.age : user?.age;
  user.mobile = data?.mobile ? data.mobile : user?.mobile;
  user.gender = data?.gender ? data.gender : user?.gender;
  user.analyticDate = new Date().toLocaleString();
  user.bio = data?.bio ? data.bio : user?.bio;
  user.fcmToken = data?.fcmToken ? data.fcmToken : user?.fcmToken;
  user.identity = data?.identity ? data.identity : user?.identity;

  await user.save();

  //return user with decrypt password
  user.password = data.password ? await cryptr.decrypt(user.password) : user.password;

  return user;
};

//check the user is exists or not with loginType 1 (email-password)
exports.checkUser = async (req, res) => {
  try {
    if (!req.query.email || !req.query.loginType || !req.query.password) return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });

    const user = await User.findOne({
      email: req.query.email,
      loginType: 1,
      isDelete: false,
    });

    if (user) {
      if (cryptr.decrypt(user.password.toString()) !== req.query.password) {
        return res.status(200).json({
          status: false,
          message: "Password doesn't match for this user.",
          isLogin: false,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "User login Successfully.",
          user,
          isLogin: true,
        });
      }
    } else {
      return res.status(200).json({
        status: true,
        message: "User must have sign up.",
        isLogin: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.checkUserForSignup = async (req, res) => {
  try {
    if (!req.query.email || !req.query.loginType || !req.query.password) return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });

    const user = await User.findOne({
      email: req.query.email,
      loginType: 1,
      isDelete: false,
    });

    if (user) {
      return res.status(200).json({
        status: false,
        message: "This email is already used. Please try with another email.",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.loginSignup = async (req, res) => {
  try {
    if (!req.body.loginType) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    let userQuery;
    if (req.body.loginType == 3) {
      if (!req.body.mobile) {
        return res.status(200).json({ status: false, message: "Mobile must be required!" });
      }

      const userQuery = await User.findOne({
        mobile: req.body.mobile,
        isDelete: false,
      });

      if (userQuery) {
        if (userQuery.isBlock) {
          console.log("mobileUser.isBlock", mobileUser.isBlock);

          return res.status(200).json({ status: false, message: "You are blocked by admin." });
        }

        const user_ = await userFunction(userQuery, req);
        console.log("with mobile no. login successfully");

        return res.status(200).json({
          status: true,
          message: "finally, user login Successfully!!",
          user: user_,
          signup: false,
        });
      } else {
        console.log("with mobile no signup ");

        const newUser = new User();

        const user = await userFunction(newUser, req);

        return res.status(200).json({
          status: true,
          message: "finally, user Signup Successfully!",
          user,
          signup: true,
        });
      }
    } else if (req.body.loginType == 2) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "Email must be required!" });
      }

      if (req.body.email) {
        userQuery = await User.findOne({
          email: req.body.email,
          isDelete: false,
        });
      }
    } else if (req.body.loginType == 1) {
      if (!req.body.email || !req.body.password) {
        return res.status(200).json({
          status: false,
          message: "email and password both must be required.",
        });
      }

      const user = await User.findOne({
        email: req.body.email,
        isDelete: false,
      });

      if (user) {
        if (!user.password) {
          return res.status(200).json({
            status: false,
            message: "User's password not found.",
          });
        }

        if (cryptr.decrypt(user.password) !== req.body.password) {
          return res.status(200).json({
            status: false,
            message: "Oops ! Password doesn't match.",
          });
        }
        userQuery = user;
      } else {
        userQuery = user;
      }
    }

    const user = userQuery;

    if (user) {
      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin." });
      }

      const user_ = await userFunction(user, req);

      return res.status(200).json({
        status: true,
        message: "finally, user login Successfully.",
        user: user_,
        signup: false,
      });
    } else {
      console.log("---------signup----------");

      let emailExists;

      if (req.body.email) {
        emailExists = await User.findOne({
          email: req.body.email,
          isDelete: false,
        });
      }

      if (emailExists) {
        return res.status(200).json({ status: false, message: "Email already exists!" });
      }

      const newUser = new User();

      const user = await userFunction(newUser, req);

      console.log("user------last", user);

      return res.status(200).json({
        status: true,
        message: "finally, user Signup Successfully!",
        user,
        signup: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }
    const user = await User.findOne({
      _id: req?.query?.userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    return res.status(200).send({
      status: true,
      message: "success!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).send({ status: false, message: "invalid details" });
    }
    const user = await User.findById(req.query.userId);
    if (!user || user?.isDelete === true) {
      return res.status(200).send({ status: false, message: "User Not found" });
    }
    user.fname = req?.body?.fname ? req?.body?.fname : user.fname;
    user.lname = req?.body?.lname ? req?.body?.lname : user.lname;
    if (req.file) {
      var image_ = user?.image?.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }

      user.image = process?.env?.baseURL + req?.file?.path;
    }
    user.password = req.body.password ? cryptr.encrypt(req.body.password) : user.password;

    user.age = req?.body?.age ? req?.body?.age : user.age;
    user.mobile = req.body.mobile ? req.body.mobile : user.mobile;
    user.gender = req?.body?.gender ? req?.body?.gender : user.gender;
    user.bio = req?.body?.bio ? req?.body?.bio : user.bio;
    user.email = req?.body?.email ? req?.body?.email : user.email;

    user.isUpdate = true;

    user.gender = req?.body?.gender ? req?.body?.gender : user.gender;
    await user.save();

    return res.status(200).send({ status: true, message: "User Updated Successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return req.status(200).send({ status: false, message: "invalid details" });
    }
    const user = await User.findById(req.query.userId);
    if (!user || user?.isDelete === true) {
      return res.status(200).send({ status: false, message: "User Not found" });
    }

    user.isDelete = true;
    await user.save();
    return res.status(200).send({ status: true, message: "User Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!req.body || !req.body.newPassword || !req.body.confirmPassword) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    if (req.body.newPassword === req.body.confirmPassword) {
      user.password = cryptr.encrypt(req.body.newPassword);
      await user.save();

      user.password = await cryptr.decrypt(user.password);

      return res.status(200).json({
        status: true,
        message: "Password Changed Successfully!!",
        user,
      });
    } else {
      return res.status(200).json({ status: false, message: "Password does not matched!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//deposite amount to wallet by user  (if coupon apply at that time customer get as bonus amount plus in existing wallet)
exports.depositeToWallet = async (req, res) => {
  try {
    const { userId, amount, paymentGateway, couponId } = req.query;

    if (!userId || !amount || !paymentGateway) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const requestedAmount = parseInt(amount);
    const userObjId = new mongoose.Types.ObjectId(userId);

    const [uniqueId, user] = await Promise.all([generateUniqueIdentifier(), User.findOne({ _id: userObjId, isDelete: false })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "Account is blocked by the admin." });
    }

    res.status(200).json({
      status: true,
      message: "Wallet successfully credited.",
    });

    let coupon;
    let bonusAmount = 0;
    let finalAmount = 0;

    if (couponId) {
      const couponObjId = new mongoose.Types.ObjectId(couponId);

      coupon = await Coupon.findOne({ _id: couponObjId, isActive: true, type: 1, expiryDate: { $gte: today } });

      if (!coupon) {
        return res.status(200).json({
          status: false,
          message: "Invalid or inactive coupon. Please try with a valid coupon or remove it.",
        });
      }

      const alreadyUsed = coupon.usedBy && coupon.usedBy.some((entry) => entry.customerId.toString() === userId.toString() && entry.usageType === 1);

      if (alreadyUsed) {
        return res.status(200).json({
          status: false,
          message: "Coupon has already been used by this customer for the specified type.",
        });
      }

      if (!alreadyUsed) {
        coupon.usedBy.push({
          customerId: userId,
          usageType: coupon.type,
        });
      }

      if (coupon.discountType == 1) {
        bonusAmount = coupon.maxDiscount;
      } else if (coupon.discountType == 2) {
        const discount = (requestedAmount * coupon.discountPercent) / 100;
        const formatedDiscount = parseFloat(discount.toFixed(2));

        bonusAmount = formatedDiscount > coupon.maxDiscount ? coupon.maxDiscount : formatedDiscount;
      }
    }

    finalAmount = requestedAmount + bonusAmount;

    user.amount += finalAmount;

    const walletHistory = new UserWalletHistory({
      user: user._id,
      amount: finalAmount,
      couponAmount: bonusAmount,
      coupon: coupon
        ? {
            title: coupon.title,
            description: coupon.description,
            code: coupon.code,
            discountType: coupon.discountType,
            maxDiscount: coupon.maxDiscount,
            minAmountToApply: coupon.minAmountToApply,
          }
        : {},
      paymentGateway: paymentGateway,
      type: 1,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm a"),
      uniqueId: uniqueId,
    });

    await Promise.all([coupon?.save(), user.save(), walletHistory.save()]);

    if (user.fcmToken && !user.isBlock && user.fcmToken !== null) {
      const adminInstance = await admin;

      const notificationPayload = {
        token: user.fcmToken,
        notification: {
          title: "💰 Amount Credited to Your Wallet 💰",
          body: `An amount of ${requestedAmount} has been successfully credited to your wallet. You can view your updated balance in the app.`,
        },
        data: {
          type: "WALLET_CREDITED",
        },
      };

      adminInstance
        .messaging()
        .send(notificationPayload)
        .then(async (response) => {
          console.log("Notification sent to user successfully:", response);

          await new Notification({
            notificationType: 0,
            userId: user._id,
            title: "💰 Amount Credited to Your Wallet 💰",
            message: `An amount of ${requestedAmount} has been successfully credited to your wallet. You can view your updated balance in the app.`,
            date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          }).save();
        })
        .catch((error) => {
          console.error("Error sending notification to user:", error);
        });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//retrive wallet history of particular user
exports.walletHistoryByUser = async (req, res) => {
  try {
    const { userId, month } = req.query;

    if (!userId || !month) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    let dateQuery;
    dateQuery = {
      month: {
        $eq: month,
      },
    };

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const [user, data] = await Promise.all([
      User.findOne({ _id: userObjId, isDelete: false }),
      UserWalletHistory.aggregate([
        {
          $addFields: {
            month: { $substr: ["$date", 0, 7] },
          },
        },
        {
          $match: {
            ...dateQuery,
            user: userObjId,
          },
        },
        {
          $project: {
            type: 1,
            uniqueId: 1,
            amount: 1,
            date: 1,
            time: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "Your account is blocked by the admin." });
    }

    const totalAmount = user.amount || 0;

    return res.status(200).json({
      status: true,
      message: "Success",
      total: totalAmount,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
