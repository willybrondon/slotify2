const express = require("express");
const route = express.Router();
const blogAdminController = require("../../controller/admin/blogAdmin.controller");

route.get("/getAll", blogAdminController.list);
route.post("/create", blogAdminController.create);
route.put("/update/:id", blogAdminController.update);
route.delete("/delete/:id", blogAdminController.remove);

module.exports = route;
