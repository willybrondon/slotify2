const Order = require("../../models/order.model");

//import model
const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");
const Salon = require("../../models/salon.model");
const Address = require("../../models/address.model");
const Notification = require("../../models/notification.model");
const UserWalletHistory = require("../../models/userWalletHistory.model");
const Coupon = require("../../models/coupon.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");

//private key
const admin = require("../../firebase");

//mongoose
const mongoose = require("mongoose");

const moment = require("moment");

const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");

//create order by the user
exports.createOrder = async (req, res) => {
  try {
    console.log("=========", req.body);

    if (!req.body.userId || !req.body.finalTotal || !req.body.type) {
      console.log("===v======", req.body);

      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const type = req.body.type.trim().toLowerCase();

    if (type === "fromcart") {
      const [uniqueIdForUserWalletHistory, user, dataFromCart] = await Promise.all([generateUniqueIdentifier(), User.findById(userId), Cart.findOne({ userId: userId })]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found!" });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      if (!dataFromCart) {
        return res.status(200).json({ status: false, message: "Cart does not found for this user." });
      }

      if (dataFromCart.items.length === 0) {
        return res.status(200).json({ status: false, message: "Items does not found in cart." });
      }

      //add data in body from cart
      const data = req.body;

      let quantityTotal = 0;
      for (let i = 0; i < dataFromCart.items.length; i++) {
        quantityTotal += dataFromCart.items[i].productQuantity;
      }
      data.totalQuantity = parseInt(quantityTotal);
      data.items = dataFromCart.items;
      data.totalItems = dataFromCart.totalItems;
      data.totalShippingCharges = dataFromCart.totalShippingCharges;
      data.userId = dataFromCart.userId;
      data.subTotal = dataFromCart.subTotal;
      data.total = dataFromCart.total;

      const today = moment().format("YYYY-MM-DD");
      let coupon, discountAmount, totalAmount;

      if (req.body.couponId) {
        const couponObjId = new mongoose.Types.ObjectId(req.body.couponId);

        coupon = await Coupon.findOne({ _id: couponObjId, isActive: true, type: 3, expiryDate: { $gte: today } });

        if (!coupon) {
          return res.status(200).json({
            status: false,
            message: "Invalid or inactive coupon. Please try with a valid coupon or remove it.",
          });
        }

        const alreadyUsed = coupon.usedBy && coupon.usedBy.some((entry) => entry.userId.toString() === userId.toString() && entry.usageType === 3);
        console.log("alreadyUsed in order create:    ", alreadyUsed);

        if (alreadyUsed) {
          return res.status(200).json({
            status: false,
            message: "Coupon has already been used by this customer for the specified type.",
          });
        }

        if (coupon.discountType === 1) {
          discountAmount = coupon.maxDiscount;
        } else if (coupon.discountType === 2) {
          const discount = (dataFromCart.total * coupon.discountPercent) / 100;
          const formatedDiscount = parseFloat(discount.toFixed(2));

          discountAmount = formatedDiscount > coupon.maxDiscount ? coupon.maxDiscount : formatedDiscount;
        }

        if (!alreadyUsed) {
          coupon.usedBy.push({
            customerId: customerObjId,
            usageType: coupon.type,
          });
        }

        totalAmount = data.total - discountAmount;
      }

      if (parseInt(req.body.finalTotal) !== totalAmount) {
        return res.status(200).json({
          status: false,
          message: "Invalid finalTotal amount!",
        });
      }

      dataFromCart.finalTotal = totalAmount;

      //generate unique orderId
      const orderId = "INV#" + Math.floor(10000 + Math.random() * 90000);
      data.orderId = orderId;

      //shipping address stored which selected by user
      const orderAddress = await Address.findOne({ userId: dataFromCart.userId, isSelect: true });

      data.shippingAddress = {};
      data.shippingAddress.name = orderAddress?.name;
      data.shippingAddress.country = orderAddress?.country;
      data.shippingAddress.state = orderAddress?.state;
      data.shippingAddress.city = orderAddress?.city;
      data.shippingAddress.zipCode = orderAddress?.zipCode;
      data.shippingAddress.address = orderAddress?.address;

      //admin commission charges
      const purchasedTimeadminCommissionCharges = settingJSON.adminCommissionCharges;
      data.purchasedTimeadminCommissionCharges = purchasedTimeadminCommissionCharges;

      //cancel order charges
      const purchasedTimecancelOrderCharges = settingJSON.cancelOrderCharges;
      data.purchasedTimeCancelOrderCharges = purchasedTimecancelOrderCharges;

      const order = new Order(data);

      //Set the status "Pending" and date of each item in the "items" array
      order.items.forEach((item) => {
        item.status = "Pending";
        item.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      });

      //user wallet history for the order (deduct from user's wallet)
      for (let i = 0; i < order.items.length; i++) {
        const product = await Product.findById(order.items[i].product);
        const salon = await Salon.findById(product.salon);

        const purchasedTimeProductPrice = parseInt(order.items[i].purchasedTimeProductPrice);
        const productQuantity = parseInt(order.items[i].productQuantity);
        const attributesArray = order.items[i].attributesArray;
        const itemId = order.items[i]._id;

        //user paid amount productQuantity wise with shipping charges
        const amountCut = purchasedTimeProductPrice * productQuantity + order.items[i].purchasedTimeShippingCharges;

        await new UserWalletHistory({
          user: user._id,
          order: order._id,
          product: product._id,
          itemId: itemId,
          amount: amountCut,
          type: 3,
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm a"),
          uniqueId: uniqueIdForUserWalletHistory,
        }).save();

        //notification related
        if (salon.fcmToken && salon.fcmToken !== null) {
          const adminPromise = await admin;

          const payload = {
            token: salon?.fcmToken,
            notification: {
              title: `Thank You for Your Order: ${user.firstName}'s Order Placed Successfully!`,
              body: "Order In Progress: We're Working on It!",
            },
          };

          adminPromise
            .messaging()
            .send(payload)
            .then(async (response) => {
              console.log("Successfully sent with response: ", response);

              const notification = new Notification();
              notification.userId = dataFromCart.userId;
              notification.image = user.image;
              notification.salonId = salon._id;
              notification.productId = product._id;
              notification.orderId = order._id;
              notification.title = payload.notification.title;
              notification.message = payload.notification.body;
              notification.notificationType = 0;
              notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
              await notification.save();
            })
            .catch((error) => {
              console.log("Error sending message:      ", error);
            });
        }
      }

      await Promise.all([
        User.updateOne(
          { _id: user._id, amount: { $gt: 0 } },
          {
            $inc: {
              amount: -parseInt(req.body.finalTotal),
            },
          }
        ),
        order.save(),
      ]);

      const populateOrder = await order.populate({
        path: "items.product",
        select: {
          productName: 1,
          mainImage: 1,
          _id: 1,
        },
      });

      res.status(200).json({
        status: true,
        message: "Order placed Successfully.",
        data: populateOrder,
      });

      //after order done cart updated
      await Cart.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            items: [],
            totalShippingCharges: 0,
            subTotal: 0,
            total: 0,
            finalTotal: 0,
            totalItems: 0,
          },
        }
      );
    } else if (type === "withoutcart") {
      if (!req.body.productId || !req.body.productQuantity || !req.body.attributesArray) {
        return res.status(200).json({ status: false, message: "Oops ! Invalid details for withoutcart!" });
      }

      const productId = new mongoose.Types.ObjectId(req.body.productId);

      const [uniqueIdForUserWalletHistory, user, product] = await Promise.all([generateUniqueIdentifier(), User.findById(userId), Product.findOne({ _id: productId, createStatus: "Approved" })]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found!" });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      const items = [
        {
          product: product._id,
          salon: product.salon._id,
          productQuantity: parseInt(req.body.productQuantity),
          productCode: product.productCode,
          purchasedTimeProductPrice: product.price,
          purchasedTimeShippingCharges: product.shippingCharges,
          attributesArray: req.body.attributesArray,
        },
      ];

      const subTotal = items[0].purchasedTimeProductPrice * parseInt(items[0].productQuantity);
      const total = subTotal + items[0].purchasedTimeShippingCharges;

      //add data in body from cart
      const data = req.body;

      let quantityTotal = 0;
      for (let i = 0; i < items.length; i++) {
        quantityTotal += items[0].productQuantity;
      }
      data.totalQuantity = parseInt(quantityTotal);
      data.items = items;
      data.totalItems = items.length;
      data.totalShippingCharges = items[0].purchasedTimeShippingCharges;
      data.userId = user._id;
      data.subTotal = subTotal;
      data.total = total;

      const today = moment().format("YYYY-MM-DD");
      let coupon,
        discountAmount = 0,
        totalAmount;

      if (req.body.couponId) {
        const couponObjId = new mongoose.Types.ObjectId(req.body.couponId);

        coupon = await Coupon.findOne({ _id: couponObjId, isActive: true, type: 3, expiryDate: { $gte: today } });

        if (!coupon) {
          return res.status(200).json({
            status: false,
            message: "Invalid or inactive coupon. Please try with a valid coupon or remove it.",
          });
        }

        const alreadyUsed = coupon.usedBy && coupon.usedBy.some((entry) => entry.userId.toString() === userId.toString() && entry.usageType === 3);
        console.log("alreadyUsed in order create:    ", alreadyUsed);

        if (alreadyUsed) {
          return res.status(200).json({
            status: false,
            message: "Coupon has already been used by this customer for the specified type.",
          });
        }

        if (coupon.discountType === 1) {
          discountAmount = coupon.maxDiscount;
        } else if (coupon.discountType === 2) {
          const discount = (total * coupon.discountPercent) / 100;
          const formatedDiscount = parseFloat(discount.toFixed(2));

          discountAmount = formatedDiscount > coupon.maxDiscount ? coupon.maxDiscount : formatedDiscount;
        }

        if (!alreadyUsed) {
          coupon.usedBy.push({
            customerId: customerObjId,
            usageType: coupon.type,
          });
        }
      }

      totalAmount = data.total - discountAmount;

      console.log("=========== subTotal ===========", subTotal);
      console.log("=========== total ===========", total);
      console.log("===========totalAmount===========", totalAmount);

      if (parseInt(req.body.finalTotal) !== totalAmount) {
        return res.status(200).json({
          status: false,
          message: "Invalid finalTotal amount!",
        });
      }

      data.finalTotal = totalAmount;

      //generate unique orderId
      const orderId = "INV#" + Math.floor(10000 + Math.random() * 90000);
      data.orderId = orderId;

      //shipping address stored which selected by user
      const orderAddress = await Address.findOne({ userId: user._id, isSelect: true });

      data.shippingAddress = {};
      data.shippingAddress.name = orderAddress?.name;
      data.shippingAddress.country = orderAddress?.country;
      data.shippingAddress.state = orderAddress?.state;
      data.shippingAddress.city = orderAddress?.city;
      data.shippingAddress.zipCode = orderAddress?.zipCode;
      data.shippingAddress.address = orderAddress?.address;

      //admin commission charges
      const purchasedTimeadminCommissionCharges = settingJSON.adminCommissionCharges;
      data.purchasedTimeadminCommissionCharges = purchasedTimeadminCommissionCharges;

      //cancel order charges
      const purchasedTimecancelOrderCharges = settingJSON.cancelOrderCharges;
      data.purchasedTimeCancelOrderCharges = purchasedTimecancelOrderCharges;

      const order = new Order(data);

      //Set the status "Pending" and date of each item in the "items" array
      order.items.forEach((item) => {
        item.status = "Pending";
        item.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      });

      //user wallet history for the order (deduct from user's wallet)
      for (let i = 0; i < order.items.length; i++) {
        const product = await Product.findById(order.items[i].product);
        const salon = await Salon.findById(product.salon);

        const purchasedTimeProductPrice = parseInt(order.items[i].purchasedTimeProductPrice);
        const productQuantity = parseInt(order.items[i].productQuantity);
        const attributesArray = order.items[i].attributesArray;
        const itemId = order.items[i]._id;

        //user paid amount productQuantity wise with shipping charges
        const amountCut = purchasedTimeProductPrice * productQuantity + order.items[i].purchasedTimeShippingCharges;

        await new UserWalletHistory({
          user: user._id,
          order: order._id,
          product: product._id,
          itemId: itemId,
          amount: amountCut,
          type: 3,
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm a"),
          uniqueId: uniqueIdForUserWalletHistory,
        }).save();

        //notification related
        if (salon.fcmToken && salon.fcmToken !== null) {
          const adminPromise = await admin;

          const payload = {
            token: salon?.fcmToken,
            notification: {
              title: `Thank You for Your Order: ${user.firstName}'s Order Placed Successfully!`,
              body: "Order In Progress: We're Working on It!",
            },
          };

          adminPromise
            .messaging()
            .send(payload)
            .then(async (response) => {
              console.log("Successfully sent with response: ", response);

              const notification = new Notification();
              notification.userId = user._id;
              notification.image = user.image;
              notification.salonId = salon._id;
              notification.productId = product._id;
              notification.orderId = order._id;
              notification.title = payload.notification.title;
              notification.message = payload.notification.body;
              notification.notificationType = 0;
              notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
              await notification.save();
            })
            .catch((error) => {
              console.log("Error sending message:      ", error);
            });
        }
      }

      await Promise.all([
        User.updateOne(
          { _id: user._id, amount: { $gt: 0 } },
          {
            $inc: {
              amount: -parseInt(req.body.finalTotal),
            },
          }
        ),
        order.save(),
      ]);

      const populateOrder = await order.populate({
        path: "items.product",
        select: {
          productName: 1,
          mainImage: 1,
          _id: 1,
        },
      });

      res.status(200).json({
        status: true,
        message: "Order placed Successfully.",
        data: populateOrder,
      });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//cancel the order by user
exports.cancelOrderByUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.orderId || !req.query.status || !req.query.itemId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const status = req.query.status.trim();

    const [user, findOrder] = await Promise.all([User.findById(req.query.userId), Order.findById(req.query.orderId)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!findOrder) {
      return res.status(200).json({ status: false, message: "Order does not found!" });
    }

    if (findOrder.userId.toString() !== user._id.toString()) {
      return res.status(200).json({ status: false, message: "This order does not belongs to your account!" });
    }

    const itemToUpdate = findOrder.items.find((item) => item._id.toString() === req.query.itemId.toString());
    if (!itemToUpdate) {
      return res.status(200).json({ status: false, message: "Item does not found in the order!" });
    }
    //console.log("itemToUpdate in cancel order by the user: ", itemToUpdate);

    if (status === "Cancelled") {
      if (itemToUpdate.status === "Out Of Delivery") {
        return res.status(200).json({ status: false, message: "This order is already Out Of Delivery, after completion you can't update it to Cancelled" });
      }

      if (itemToUpdate.status === "Delivered") {
        return res.status(200).json({ status: false, message: "This order is already Delivered , you can't update it to Cancelled" });
      }

      if (itemToUpdate.status === "Cancelled") {
        return res.status(200).json({ status: false, message: "You can't cancel this order, This order is already cancelled" });
      }

      const purchasedTimeProductPrice = parseInt(itemToUpdate.purchasedTimeProductPrice);
      const productQuantity = parseInt(itemToUpdate.productQuantity);
      const purchasedTimeShippingCharges = parseInt(itemToUpdate.purchasedTimeShippingCharges);

      const cancelOrderCharges = (purchasedTimeProductPrice * findOrder.purchasedTimeCancelOrderCharges) / 100;
      console.log("--------cancelOrderCharges---------", cancelOrderCharges);

      const chargesPerProductQuantity = cancelOrderCharges * productQuantity;
      console.log("--------chargesPerProductQuantity---------", chargesPerProductQuantity);

      const refundAmount = purchasedTimeProductPrice * productQuantity + purchasedTimeShippingCharges - chargesPerProductQuantity;
      console.log("--------refundAmount---------", refundAmount);

      const [uniqueId, uniqueId1, updatedOrder, userUpdate, userWalletHistory] = await Promise.all([
        generateUniqueIdentifier(),
        generateUniqueIdentifier(),
        Order.findOneAndUpdate(
          { _id: findOrder._id, "items._id": itemToUpdate._id },
          {
            $set: {
              "items.$.status": "Cancelled",
            },
          },
          { new: true }
        ),
        User.updateOne(
          { _id: user._id, amount: { $gt: 0 } },
          {
            $inc: {
              amount: Math.round(Math.abs(refundAmount)),
            },
          }
        ),
        UserWalletHistory.deleteMany({ itemId: itemToUpdate._id }),
      ]);

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Cancelled",
        data: updatedOrder,
      });

      const product = await Product.findById(itemToUpdate.product);
      const salon = await Salon.findById(product.salon);
      const attributesArray = itemToUpdate.attributesArray;

      const updateRecordIndex = updatedOrder.items.findIndex(
        (item) => item?.product.toString() === product._id.toString() && item?.salon.toString() === salon._id.toString() && JSON.stringify(item?.attributesArray) === JSON.stringify(attributesArray)
      );
      console.log("updateRecordIndex:         ", updateRecordIndex);

      if (updateRecordIndex !== -1) {
        updatedOrder.items[updateRecordIndex].cancelOrderChargesPerProductQuantity = chargesPerProductQuantity;
        await Order.findOneAndUpdate({ _id: updatedOrder._id }, { items: updatedOrder.items }, { new: true });
      }

      await Promise.all([
        new UserWalletHistory({
          user: user._id,
          order: findOrder._id,
          product: itemToUpdate.product,
          itemId: itemToUpdate._id,
          amount: Math.round(Math.abs(chargesPerProductQuantity)),
          type: 4,
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm a"),
          uniqueId: uniqueId,
        }).save(),
        new UserWalletHistory({
          user: user._id,
          order: findOrder._id,
          product: itemToUpdate.product,
          itemId: itemToUpdate._id,
          amount: Math.round(Math.abs(refundAmount)),
          type: 5,
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm a"),
          uniqueId: uniqueId1,
        }).save(),
      ]);

      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🛑 Your Order Has Been Cancelled 🛑",
            body: "We're sorry to inform you that your order has been canceled. Please contact support if you need assistance.",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = user._id;
            notification.title = payload.notification.title;
            notification.image = user.image;
            notification.notificationType = 0;
            notification.message = payload.notification.body;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else {
      return res.status(200).json({ status: false, message: "status must be passed be valid" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get particular user's status wise orders
exports.ordersOfUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.status || !req.query.start || !req.query.limit) {
      return res.status(200).json({ status: true, message: "Oops ! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(200).json({ status: true, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    let statusQuery = {};
    if (req.query.status === "Pending") {
      statusQuery = { "items.status": "Pending" };
    } else if (req.query.status === "Confirmed") {
      statusQuery = { "items.status": "Confirmed" };
    } else if (req.query.status === "Out Of Delivery") {
      statusQuery = { "items.status": "Out Of Delivery" };
    } else if (req.query.status === "Delivered") {
      statusQuery = { "items.status": "Delivered" };
    } else if (req.query.status === "Cancelled") {
      statusQuery = { "items.status": "Cancelled" };
    } else if (req.query.status === "All") {
      statusQuery = {
        "items.status": {
          $in: ["Pending", "Confirmed", "Out Of Delivery", "Delivered", "Cancelled"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const [totalOrder, orderData] = await Promise.all([
      Order.countDocuments({ userId: user._id, ...statusQuery }),
      Order.find({ userId: user._id, ...statusQuery })
        .populate({
          path: "items.product",
          select: {
            brand: 1,
            productName: 1,
            mainImage: 1,
            _id: 1,
          },
        })
        .skip(start * limit)
        .limit(limit),
    ]);

    if (req.query.status !== "All") {
      orderData.forEach((order) => {
        order.items = order?.items.filter((item) => item?.status === req?.query?.status);
      });
    }

    return res.status(200).json({
      status: true,
      messages: `Retrive OrderHistory for User with status ${req.query.status}`,
      totalOrder: totalOrder || 0,
      orderData: orderData.length > 0 ? orderData : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
