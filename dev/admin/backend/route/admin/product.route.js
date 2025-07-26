const express = require("express");
const route = express.Router();

const productController = require("../../controller/admin/product.controller");

const checkAccessWithSecretKey = require("../../middleware/checkAccess");

const multer = require("multer");
const storage = require("./../../middleware/multer");
const upload = multer({ storage });

//product request accept or decline (create product)
route.patch("/acceptCreateRequest", checkAccessWithSecretKey(), productController.acceptCreateRequest);

//get status wise create product requests
route.get("/statusWiseProduct", checkAccessWithSecretKey(), productController.statusWiseProduct);

//update product
route.patch(
  "/updateProduct",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  productController.updateProduct
);

//product handle (isTrending OR isOutOfStock OR isNewCollection)
route.patch("/manageProduct", checkAccessWithSecretKey(), productController.manageProduct);

//get product details
route.get("/productDetails", checkAccessWithSecretKey(), productController.productDetails);

//get products
route.get("/getProducts", checkAccessWithSecretKey(), productController.getProducts);

//delete product
route.delete("/deleteProduct", checkAccessWithSecretKey(), productController.deleteProduct);

module.exports = route;
