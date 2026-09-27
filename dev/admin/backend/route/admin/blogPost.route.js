const express = require("express");
const route = express.Router();
const blogPostController = require("../../controller/admin/blogPost.controller");

route.get("/getAll", blogPostController.list);
route.get("/get/:id", blogPostController.getOne);
route.put("/publish/:id", blogPostController.publish);
route.put("/reject/:id", blogPostController.reject);
route.put("/unpublish/:id", blogPostController.unpublish);

module.exports = route;
