const Order = require("../../models/order.model");
const Salon = require("../../models/salon.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");
const UserWalletHistory = require("../../models/userWalletHistory.model");
const Notification = require("../../models/notification.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");

const mongoose = require("mongoose");
const moment = require("moment");

const admin = require("../../firebase");

const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");

//get status wise orders (all orders)
exports.getOrders = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const status = req.query.status.trim();

    let statusQuery = {};
    if (status === "Pending") {
      statusQuery = { "items.status": "Pending" };
    } else if (status === "Confirmed") {
      statusQuery = { "items.status": "Confirmed" };
    } else if (status === "Out Of Delivery") {
      statusQuery = { "items.status": "Out Of Delivery" };
    } else if (status === "Delivered") {
      statusQuery = { "items.status": "Delivered" };
    } else if (status === "Cancelled") {
      statusQuery = { "items.status": "Cancelled" };
    } else if (status === "All") {
      statusQuery = {
        "items.status": {
          $in: ["Pending", "Confirmed", "Out Of Delivery", "Delivered", "Cancelled"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const [totalOrders, orders] = await Promise.all([
      Order.countDocuments(statusQuery),
      Order.find(statusQuery)
        .populate({
          path: "items.product",
          select: {
            productName: 1,
            mainImage: 1,
            _id: 1,
          },
        })
        .populate({
          path: "items.salon",
          select: "businessName",
        })
        .populate({
          path: "userId",
          select: "fname lname uniqueId",
        })
        .sort({ createdAt: -1 })
        .skip(start * limit)
        .limit(limit),
    ]);

    if (status !== "All") {
      orders.forEach((order) => {
        order.items = order?.items.filter((item) => item?.status === req?.query?.status);
      });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive orders Successfully!",
      totalOrders,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get salon's orders
exports.fetchOrdersOfSalon = async (req, res) => {
  try {
    if (!req.query.status || !req.query.salonId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const salonId = new mongoose.Types.ObjectId(req.query.salonId);
    const status = req.query.status.trim();

    if (status === "Pending") {
      const [salon, order] = await Promise.all([
        Salon.findById(salonId),
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {
              "items.salon": salonId,
              "items.status": "Pending",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "products",
              localField: "items.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $group: {
              _id: "$_id",
              items: {
                $push: {
                  item: "$items",
                  productName: "$productDetails.productName",
                  mainImage: "$productDetails.mainImage",
                },
              },
              shippingAddress: { $first: "$shippingAddress" },
              orderId: { $first: "$orderId" },
              paymentGateway: { $first: "$paymentGateway" },
              userFirstName: { $first: "$user.fname" },
              userLastName: { $first: "$user.lname" },
            },
          },
          {
            $project: {
              _id: 1,
              items: 1,
              shippingAddress: 1,
              orderId: 1,
              paymentGateway: 1,
              userFirstName: 1,
              userLastName: 1,
            },
          },
        ]),
      ]);

      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon does not found." });
      }

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: order,
      });
    } else if (status === "Confirmed") {
      const [salon, order] = await Promise.all([
        Salon.findById(salonId),
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {
              "items.salon": salonId,
              "items.status": "Confirmed",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "products",
              localField: "items.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $group: {
              _id: "$_id",
              items: {
                $push: {
                  item: "$items",
                  productName: "$productDetails.productName",
                  mainImage: "$productDetails.mainImage",
                },
              },
              shippingAddress: { $first: "$shippingAddress" },
              orderId: { $first: "$orderId" },
              paymentGateway: { $first: "$paymentGateway" },
              userFirstName: { $first: "$user.fname" },
              userLastName: { $first: "$user.lname" },
            },
          },
          {
            $project: {
              _id: 1,
              items: 1,
              shippingAddress: 1,
              orderId: 1,
              paymentGateway: 1,
              userFirstName: 1,
              userLastName: 1,
            },
          },
        ]),
      ]);

      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon does not found." });
      }

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: order,
      });
    } else if (status === "Out Of Delivery") {
      const [salon, order] = await Promise.all([
        Salon.findById(salonId),
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {
              "items.salon": salonId,
              "items.status": "Out Of Delivery",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "products",
              localField: "items.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $group: {
              _id: "$_id",
              items: {
                $push: {
                  item: "$items",
                  productName: "$productDetails.productName",
                  mainImage: "$productDetails.mainImage",
                },
              },
              shippingAddress: { $first: "$shippingAddress" },
              orderId: { $first: "$orderId" },
              paymentGateway: { $first: "$paymentGateway" },
              userFirstName: { $first: "$user.fname" },
              userLastName: { $first: "$user.lname" },
            },
          },
          {
            $project: {
              _id: 1,
              items: 1,
              shippingAddress: 1,
              orderId: 1,
              paymentGateway: 1,
              userFirstName: 1,
              userLastName: 1,
            },
          },
        ]),
      ]);

      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon does not found." });
      }

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: order,
      });
    } else if (status === "Delivered") {
      const [salon, order] = await Promise.all([
        Salon.findById(salonId),
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {
              "items.salon": salonId,
              "items.status": "Delivered",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "products",
              localField: "items.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $group: {
              _id: "$_id",
              items: {
                $push: {
                  item: "$items",
                  productName: "$productDetails.productName",
                  mainImage: "$productDetails.mainImage",
                },
              },
              shippingAddress: { $first: "$shippingAddress" },
              orderId: { $first: "$orderId" },
              paymentGateway: { $first: "$paymentGateway" },
              userFirstName: { $first: "$user.fname" },
              userLastName: { $first: "$user.lname" },
            },
          },
          {
            $project: {
              _id: 1,
              items: 1,
              shippingAddress: 1,
              orderId: 1,
              paymentGateway: 1,
              userFirstName: 1,
              userLastName: 1,
            },
          },
        ]),
      ]);

      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon does not found." });
      }

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: order,
      });
    } else if (status === "Cancelled") {
      const [salon, order] = await Promise.all([
        Salon.findById(salonId),
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {
              "items.salon": salonId,
              "items.status": "Cancelled",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "products",
              localField: "items.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $group: {
              _id: "$_id",
              items: {
                $push: {
                  item: "$items",
                  productName: "$productDetails.productName",
                  mainImage: "$productDetails.mainImage",
                },
              },
              shippingAddress: { $first: "$shippingAddress" },
              orderId: { $first: "$orderId" },
              paymentGateway: { $first: "$paymentGateway" },
              userFirstName: { $first: "$user.fname" },
              userLastName: { $first: "$user.lname" },
            },
          },
          {
            $project: {
              _id: 1,
              items: 1,
              shippingAddress: 1,
              orderId: 1,
              paymentGateway: 1,
              userFirstName: 1,
              userLastName: 1,
            },
          },
        ]),
      ]);

      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon does not found." });
      }

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: order,
      });
    } else if (status === "All") {
      const [salon, order] = await Promise.all([
        Salon.findById(salonId),
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {
              "items.salon": salonId,
              "items.status": {
                $in: ["Pending", "Confirmed", "Out Of Delivery", "Delivered", "Cancelled"],
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "products",
              localField: "items.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $group: {
              _id: "$_id",
              items: {
                $push: {
                  item: "$items",
                  productName: "$productDetails.productName",
                  mainImage: "$productDetails.mainImage",
                },
              },
              shippingAddress: { $first: "$shippingAddress" },
              orderId: { $first: "$orderId" },
              paymentGateway: { $first: "$paymentGateway" },
              userFirstName: { $first: "$user.fname" },
              userLastName: { $first: "$user.lname" },
            },
          },
          {
            $project: {
              _id: 1,
              items: 1,
              shippingAddress: 1,
              orderId: 1,
              paymentGateway: 1,
              userFirstName: 1,
              userLastName: 1,
            },
          },
        ]),
      ]);

      if (!salon) {
        return res.status(200).json({ status: false, message: "Salon does not found." });
      }

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: order,
      });
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//get particular order Wise order details
exports.fetchOrderInfo = async (req, res) => {
  try {
    if (!req.query.orderId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const order = await Order.findById(req.query.orderId);
    if (!order) {
      return res.status(200).json({ status: false, message: "Order does not found." });
    }

    const orderWithProducts = await Order.findOne({ _id: order._id })
      .populate({
        path: "items.product",
        select: "brand productName mainImage _id",
      })
      .populate({
        path: "items.salon",
        select: "name uniqueId",
      });

    return res.status(200).json({
      status: true,
      message: "Retrive order details Successfully.",
      order: orderWithProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.orderId || !req.query.status || !req.query.itemId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const status = req.query.status.trim();
    const [user, findOrder] = await Promise.all([User.findById(req.query.userId), Order.findById(req.query.orderId)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!findOrder) {
      return res.status(200).json({ status: false, message: "Order does not found." });
    }

    if (findOrder.userId.toString() !== user._id.toString()) {
      return res.status(200).json({ status: false, message: "This order does not belongs to your account." });
    }

    const itemToUpdate = findOrder.items.find((item) => item._id.toString() === req?.query?.itemId.toString());
    if (!itemToUpdate) {
      return res.status(200).json({ status: false, message: "Item does not found in the order." });
    }
    //console.log("itemToUpdate: ", itemToUpdate);

    if (status === "Pending") {
      if (itemToUpdate.status === "Pending") {
        return res.status(200).json({ status: false, message: "This order is already in Pending" });
      }

      if (itemToUpdate.status === "Confirmed") {
        return res.status(200).json({ status: false, message: "This order is already Confirmed, after completion you can't update it to Pending" });
      }

      if (itemToUpdate.status === "Out Of Delivery") {
        return res.status(200).json({ status: false, message: "This order is already Out Of Delivery, after completion you can't update it to Pending" });
      }

      if (itemToUpdate.status === "Delivered") {
        return res.status(200).json({ status: false, message: "This order is already Delivered, after completion you can't update it to Pending" });
      }

      if (itemToUpdate.status === "Cancelled") {
        return res.status(200).json({ status: false, message: "This order is already Cancelled , after cancellation you can't update it to Pending" });
      }
    } else if (status === "Confirmed") {
      if (itemToUpdate.status === "Confirmed") {
        return res.status(200).json({ status: false, message: "This order is already Confirmed" });
      }

      if (itemToUpdate.status === "Out Of Delivery") {
        return res.status(200).json({ status: false, message: "This order is already Out Of Delivery, after completion you can't update it to Confirmed" });
      }

      if (itemToUpdate.status === "Delivered") {
        return res.status(200).json({ status: false, message: "This order is already Delivered, after completion you can't update it to Confirmed" });
      }

      if (itemToUpdate.status === "Cancelled") {
        return res.status(200).json({ status: false, message: "This order is already Cancelled , after cancellation you can't update it to Confirmed" });
      }

      const itemObjId = new mongoose.Types.ObjectId(itemToUpdate._id);

      const [uniqueIdForSalonWalletHistory, updatedOrder] = await Promise.all([
        generateUniqueIdentifier(),
        Order.findOneAndUpdate(
          { _id: findOrder._id, "items._id": itemObjId },
          {
            $set: {
              "items.$.status": "Confirmed",
            },
          },
          { new: true }
        ),
      ]);

      const product = await Product.findById(itemToUpdate.product);
      const salon = await Salon.findById(product.salon);

      const purchasedTimeProductPrice = parseInt(itemToUpdate.purchasedTimeProductPrice);
      const productQuantity = parseInt(itemToUpdate.productQuantity);
      const itemId = itemToUpdate._id;
      const attributesArray = itemToUpdate.attributesArray;

      //calculate adminCommission on purchasedTimeProductPrice
      const adminCommission = (purchasedTimeProductPrice * findOrder.purchasedTimeadminCommissionCharges) / 100; //the admin commission is ___% of the productPrice

      //admin commission earned per productQuantity
      const commissionPerProductQuantity = adminCommission * productQuantity;

      //salonEarning per productQuantity after deduction of admin commission per productQuantity
      const salonEarning = purchasedTimeProductPrice * productQuantity - adminCommission * productQuantity;
      console.log("-------salonEarning--------", salonEarning);

      const updateRecordIndex = updatedOrder.items.findIndex(
        (item) => item?.product.toString() === product._id.toString() && item?.salon.toString() === salon._id.toString() && JSON.stringify(item?.attributesArray) === JSON.stringify(attributesArray)
      );
      console.log("updateRecordIndex:         ", updateRecordIndex);

      let orderUpdate;
      if (updateRecordIndex !== -1) {
        updatedOrder.items[updateRecordIndex].commissionPerProductQuantity = commissionPerProductQuantity;
        orderUpdate = await Order.findOneAndUpdate({ _id: updatedOrder._id }, { items: updatedOrder.items }, { new: true });
      }

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Confirmed",
        data: orderUpdate,
      });

      await Promise.all([
        Salon.findOneAndUpdate({ _id: salon._id, earning: { $gt: 0 } }, { $inc: { earning: salonEarning } }, { new: true })
          .then((updatedSalon) => {
            console.log("Updated Salon Earning", updatedSalon.earning);
          })
          .catch((err) => {
            console.error(err);
          }),
        new SalonExpertWalletHistory({
          salon: salon._id,
          order: findOrder._id,
          product: product._id,
          itemId: itemId,
          amount: salonEarning,
          commissionPerProductQuantity: commissionPerProductQuantity,
          type: 3,
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm a"),
          uniqueId: uniqueIdForSalonWalletHistory,
        }).save(),
      ]);

      if (salon.fcmToken && salon.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: salon?.fcmToken,
          notification: {
            title: "📥 New Order Confirmed!",
            body: "You have received a new order. Please review and process it promptly.🛠️",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.salonId = salon._id;
            notification.title = payload.notification.title;
            notification.image = salon.image;
            notification.notificationType = 2;
            notification.message = payload.notification.body;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }

      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "✅ Your Order Has Been Confirmed!",
            body: "Thank you for your purchase! Your order is confirmed and will be processed shortly. 📦",
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
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    } else if (status === "Out Of Delivery") {
      if (!req.body.deliveredServiceName || !req.body.trackingId || !req.body.trackingLink) {
        return res.status(200).json({ status: false, message: "trackingId,trackingLink,deliveredServiceName must be requried!" });
      }

      if (itemToUpdate.status !== "Confirmed")
        return res.status(200).json({
          status: false,
          message: "This order is not Confirmed , after Confirmed you can update it to Out Of Delivery",
        });

      if (itemToUpdate.status === "Out Of Delivery")
        return res.status(200).json({
          status: false,
          message: "This order is already Out Of Delivery",
        });

      if (itemToUpdate.status === "Delivered")
        return res.status(200).json({
          status: false,
          message: "This order is already Delivered, after completion you can't update it to Out Of Delivery",
        });

      if (itemToUpdate.status === "Cancelled")
        return res.status(200).json({
          status: false,
          message: "This order is already Cancelled, after cancellation you can't update it to Out Of Delivery",
        });

      const updatedOrder = await Order.findOneAndUpdate(
        { _id: findOrder._id, "items._id": itemToUpdate._id },
        {
          $set: {
            "items.$.status": "Out Of Delivery",
            "items.$.deliveredServiceName": req.body.deliveredServiceName.trim(),
            "items.$.trackingId": req.body.trackingId.trim(),
            "items.$.trackingLink": req.body.trackingLink.trim(),
          },
        },
        { new: true }
      );

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Out Of Delivery",
        data: updatedOrder,
      });

      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🚚 Your Order is Out for Delivery!",
            body: "Great news! Your order is on its way and will arrive soon. 🕒 Please be ready to receive it!",
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
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    } else if (status === "Delivered") {
      if (itemToUpdate.status === "Delivered") {
        return res.status(200).json({ status: false, message: "This order is already Delivered" });
      }

      if (itemToUpdate.status === "Cancelled")
        return res.status(200).json({
          status: false,
          message: "This order is already Cancelled , after cancellation you can't update it to Delivered",
        });

      if (itemToUpdate.status !== "Out Of Delivery")
        return res.status(200).json({
          status: false,
          message: "This order is not Out Of Delivery , after Out Of Delivery you can update it to Delivered",
        });

      const [updatedOrder, updateProduct] = await Promise.all([
        Order.findOneAndUpdate(
          { _id: findOrder._id, "items._id": itemToUpdate._id },
          {
            $set: {
              "items.$.status": "Delivered",
            },
          },
          { new: true }
        ),
        Product.findOneAndUpdate({ _id: itemToUpdate.product }, { $inc: { sold: itemToUpdate.productQuantity } }), //update the "sold" field in the product model by incrementing it by the quantity ordered
      ]);

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Delivered",
        data: updatedOrder,
      });

      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "📦 Your Order Has Arrived! 🎉",
            body: "Your order is delivered! We hope you enjoy it. 😊 If you need any assistance, feel free to reach out to us.",
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
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    } else if (status === "Cancelled") {
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
      const chargesPerProductQuantity = cancelOrderCharges * productQuantity;
      const refundAmount = purchasedTimeProductPrice * productQuantity + purchasedTimeShippingCharges - chargesPerProductQuantity;

      console.log("--------cancelOrderCharges---------", cancelOrderCharges);
      console.log("--------chargesPerProductQuantity---------", chargesPerProductQuantity);
      console.log("--------refundAmount---------", refundAmount);

      // Check if finalTotal is less than chargesPerProductQuantity
      if (refundAmount < chargesPerProductQuantity) {
        return res.status(200).json({
          status: false,
          message: "Cancellation not allowed as refund amount is less than the cancellation charges",
        });
      }

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
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get particular user's status wise orders
exports.fetchOrdersOfUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.status) {
      return res.status(200).json({ status: true, message: "Oops ! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

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

    const [user, totalOrder, orderData] = await Promise.all([
      User.findById(userId),
      Order.countDocuments({ userId: userId, ...statusQuery }),
      Order.find({ userId: userId, ...statusQuery })
        .populate({
          path: "items.product",
          select: {
            brand: 1,
            productName: 1,
            mainImage: 1,
            _id: 1,
          },
        })
        .populate({
          path: "userId",
          select: {
            fname: 1,
            lname: 1,
            uniqueId: 1,
          },
        })
        .skip(start * limit)
        .limit(limit),
    ]);

    if (!user) {
      return res.status(200).json({ status: true, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

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
