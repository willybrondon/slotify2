const Cart = require("../../models/cart.model");

//import model
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Salon = require("../../models/salon.model");

//mongoose
const mongoose = require("mongoose");

//add product to cart for user
exports.addToCart = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.productId || !req.body.productQuantity || !req.body.attributesArray) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);

    const [product, user, cart] = await Promise.all([Product.findOne({ _id: productId, createStatus: "Approved" }), User.findOne({ _id: userId }), Cart.findOne({ userId: userId })]);

    if (!product) {
      return res.status(200).json({ status: false, message: "Product not found!" });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin!" });
    }

    console.log("req.body.attributesArray", req.body.attributesArray);

    if (cart) {
      const salonId = product.salon.toString();
      const differentSalonProductsInCart = cart.items.some((item) => item.salon.toString() !== salonId);
      console.log("different Salon's Products In Cart:   ", differentSalonProductsInCart);

      if (differentSalonProductsInCart) {
        return res.status(200).json({
          status: false,
          message: "Only one salon's products can be added to the cart at a time!",
        });
      }

      console.log("Cart already exists");

      let itemIndex = cart.items.findIndex((item) => {
        return (
          item.product.toString() === product._id.toString() &&
          item.attributesArray.length === req.body.attributesArray.length &&
          item.attributesArray.every((attr, index) => attr.name === req.body.attributesArray[index].name && attr.value === req.body.attributesArray[index].value)
        );
      });

      console.log("itemIndex-----------------------", itemIndex);

      if (itemIndex !== -1) {
        //If the same product with the same attributesArray already exists in the cart, update the productQuantity
        cart.items[itemIndex].productQuantity += parseInt(req.body.productQuantity);
      } else {
        //If the same product with a different attributesArray, or a new product is being added, push a new item to the items array
        cart.items.push({
          product: product._id,
          salon: product.salon._id,
          productCode: product.productCode,
          productQuantity: parseInt(req.body.productQuantity),
          purchasedTimeProductPrice: product.price,
          purchasedTimeShippingCharges: product.shippingCharges,
          attributesArray: req.body.attributesArray,
        });
      }

      const productIds = [];
      cart.totalShippingCharges = 0;
      cart.items.map((val) => {
        if (val?.product) {
          const product = productIds.includes(val.product.toString());
          if (!product) {
            productIds.push(val.product.toString());
            cart.totalShippingCharges += val.purchasedTimeShippingCharges;
          }
        }
      });

      cart.subTotal = 0;
      cart.items.map((item) => {
        if (item?.product) {
          cart.subTotal += item.purchasedTimeProductPrice * parseInt(item.productQuantity);
        }
      });

      cart.total = cart.subTotal + cart.totalShippingCharges;
      cart.totalItems = cart.items.length;
      await cart.save();

      const data = await cart.populate({
        path: "items.product",
        select: {
          productName: 1,
          mainImage: 1,
          _id: 1,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Product added to cart.",
        data: data,
      });
    } else {
      console.log("new cart created");

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

      const newCart = new Cart();

      newCart.userId = user._id;
      newCart.items = items;
      newCart.totalShippingCharges = items[0].purchasedTimeShippingCharges;
      newCart.subTotal = subTotal;
      newCart.total = total;
      newCart.totalItems = items.length;
      await newCart.save();

      const data = await newCart.populate({
        path: "items.product",
        select: {
          productName: 1,
          mainImage: 1,
          _id: 1,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Product added to cart.",
        data: data,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//remove product from cart for user
exports.removeFromCart = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.productId || !req.body.productQuantity || !req.body.attributesArray) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);

    const [product, user, cartByUser] = await Promise.all([Product.findOne({ _id: productId, createStatus: "Approved" }), User.findById(userId), Cart.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    if (!product) {
      return res.status(200).json({ status: false, message: "Product does not found!" });
    }

    if (!cartByUser) {
      return res.status(200).json({ status: false, message: "Cart does not found for this user!" });
    }

    let attributes;
    if (typeof req.body.attributesArray === "string") {
      console.log("attributesArray in body: ", typeof req.body.attributesArray);

      attributes = JSON.parse(req.body.attributesArray);
    } else if (typeof req.body.attributesArray === "object") {
      console.log("attributesArray in body: ", typeof req.body.attributesArray);

      attributes = req.body.attributesArray;
    } else {
      return res.status(200).json({
        status: false,
        message: "Invalid attributes format",
      });
    }

    let result = null;

    if (cartByUser?.items?.length) {
      if (Array.isArray(attributes)) {
        const updateRecordIndex = cartByUser.items.findIndex((item) => item?.product.toString() === product._id.toString() && JSON.stringify(item?.attributesArray) === JSON.stringify(attributes));
        console.log("updateRecordIndex: ", updateRecordIndex);

        if (updateRecordIndex !== -1) {
          if (cartByUser.items[updateRecordIndex]?.productQuantity >= parseInt(req.body.productQuantity)) {
            const updatedQuan = Number(cartByUser.items[updateRecordIndex].productQuantity) - Number(req?.body?.productQuantity);
            cartByUser.items[updateRecordIndex].productQuantity = updatedQuan;

            var purchasedTimeProductPrice;
            purchasedTimeProductPrice = cartByUser.items[updateRecordIndex].purchasedTimeProductPrice;

            const subTotal = cartByUser.subTotal - purchasedTimeProductPrice * parseInt(req.body.productQuantity);
            const total = cartByUser.total - purchasedTimeProductPrice * parseInt(req.body.productQuantity);

            result = await Cart.findOneAndUpdate(
              { _id: cartByUser._id },
              {
                items: cartByUser.items,
                subTotal,
                total,
              },
              { new: true }
            );
          } else {
            return res.status(200).json({ status: false, message: "Product's productQuantity does not found in the cart." });
          }

          if (result && result.items.some((item) => item.productQuantity === 0)) {
            const filteredItems = result.items.filter((item) => item.productQuantity !== 0);

            const shippingCharges = [...new Set(filteredItems.map((item) => item.purchasedTimeShippingCharges))];
            console.log("shippingCharges:  ", shippingCharges);

            let updatedTotalShippingCharges = 0;
            for (const value of shippingCharges) {
              updatedTotalShippingCharges += value;
            }
            console.log("updatedTotalShippingCharges:  ", updatedTotalShippingCharges);

            const subTotal = cartByUser.subTotal - purchasedTimeProductPrice * parseInt(req.body.productQuantity);
            const total = subTotal + updatedTotalShippingCharges;

            result = await Cart.findOneAndUpdate(
              { _id: cartByUser._id },
              {
                $pull: {
                  items: {
                    product: product._id,
                    productQuantity: 0,
                  },
                },
                $set: {
                  subTotal,
                  total,
                  totalItems: result.totalItems - 1,
                  totalShippingCharges: updatedTotalShippingCharges,
                },
              },
              { new: true }
            );
          }

          if (result.totalItems === 0 || result.items.length === 0) {
            await Cart.findByIdAndDelete(result._id); //_id of the cart

            return res.status(200).json({
              status: true,
              message: "Product removed from cart and cart deleted.",
              data: null,
            });
          }
        } else {
          return res.status(200).json({ status: false, message: "Product with specified attributes not found in the cart." });
        }
      } else {
        console.log("req.body.attributesArray is not an array.");
      }
    }

    const data = await Cart.populate(result, {
      path: "items.product",
      select: {
        productName: 1,
        mainImage: 1,
        _id: 1,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Product removed from the cart!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//get all products added to cart for user
exports.getCartProduct = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, cart] = await Promise.all([User.findById(userId), Cart.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin!" });
    }

    if (!cart) {
      return res.status(200).json({
        status: false,
        message: "Cart does not found for this user.",
        data: {
          totalShippingCharges: 0,
          subTotal: 0,
          total: 0,
          finalTotal: 0,
          totalItems: 0,
          items: [],
        },
      });
    }

    const populatedCart = await cart.populate({
      path: "items.product",
      select: {
        productName: 1,
        mainImage: 1,
        _id: 1,
      },
    });

    if (populatedCart.items.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No products found in the cart.",
        data: populatedCart.items,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive all products added to cart.",
      data: populatedCart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//delete the cart of particular user
exports.deleteCart = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, cartByUser] = await Promise.all([User.findById(userId), Cart.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    if (!cartByUser) {
      return res.status(200).json({ status: false, message: "Cart does not found for this user." });
    }

    await Cart.deleteOne(cartByUser._id);

    return res.status(200).json({
      status: true,
      message: "Remove all products from the cart for this user!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
