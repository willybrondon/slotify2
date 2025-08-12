require("dotenv").config();
const mongoose = require("mongoose");

// Set default baseURL if not provided in environment
if (!process.env.baseURL) {
  process.env.baseURL = "https://skedisy.com";
}

// Import models
const Salon = require("./models/salon.model");
const Expert = require("./models/expert.model");
const User = require("./models/user.model");
const Service = require("./models/service.model");
const Category = require("./models/category.model");
const Product = require("./models/product.model");
const Notification = require("./models/notification.model");

// Connect to MongoDB
require("./middleware/mongodb");

async function updateImageUrls() {
  try {
    console.log("Starting image URL update...");
    
    const oldBaseUrl = "http://46.101.229.176:5000";
    const newBaseUrl = "https://skedisy.com";
    
    // Update Salon images
    const salons = await Salon.find({
      $or: [
        { mainImage: { $regex: oldBaseUrl } },
        { images: { $regex: oldBaseUrl } }
      ]
    });
    
    for (const salon of salons) {
      if (salon.mainImage && salon.mainImage.includes(oldBaseUrl)) {
        salon.mainImage = salon.mainImage.replace(oldBaseUrl, newBaseUrl);
      }
      if (salon.images && Array.isArray(salon.images)) {
        salon.images = salon.images.map(img => 
          img.includes(oldBaseUrl) ? img.replace(oldBaseUrl, newBaseUrl) : img
        );
      }
      await salon.save();
    }
    console.log(`Updated ${salons.length} salon records`);
    
    // Update Expert images
    const experts = await Expert.find({ image: { $regex: oldBaseUrl } });
    for (const expert of experts) {
      if (expert.image && expert.image.includes(oldBaseUrl)) {
        expert.image = expert.image.replace(oldBaseUrl, newBaseUrl);
        await expert.save();
      }
    }
    console.log(`Updated ${experts.length} expert records`);
    
    // Update User images
    const users = await User.find({ image: { $regex: oldBaseUrl } });
    for (const user of users) {
      if (user.image && user.image.includes(oldBaseUrl)) {
        user.image = user.image.replace(oldBaseUrl, newBaseUrl);
        await user.save();
      }
    }
    console.log(`Updated ${users.length} user records`);
    
    // Update Service images
    const services = await Service.find({ image: { $regex: oldBaseUrl } });
    for (const service of services) {
      if (service.image && service.image.includes(oldBaseUrl)) {
        service.image = service.image.replace(oldBaseUrl, newBaseUrl);
        await service.save();
      }
    }
    console.log(`Updated ${services.length} service records`);
    
    // Update Category images
    const categories = await Category.find({ image: { $regex: oldBaseUrl } });
    for (const category of categories) {
      if (category.image && category.image.includes(oldBaseUrl)) {
        category.image = category.image.replace(oldBaseUrl, newBaseUrl);
        await category.save();
      }
    }
    console.log(`Updated ${categories.length} category records`);
    
    // Update Product images
    const products = await Product.find({
      $or: [
        { mainImage: { $regex: oldBaseUrl } },
        { images: { $regex: oldBaseUrl } }
      ]
    });
    
    for (const product of products) {
      if (product.mainImage && product.mainImage.includes(oldBaseUrl)) {
        product.mainImage = product.mainImage.replace(oldBaseUrl, newBaseUrl);
      }
      if (product.images && Array.isArray(product.images)) {
        product.images = product.images.map(img => 
          img.includes(oldBaseUrl) ? img.replace(oldBaseUrl, newBaseUrl) : img
        );
      }
      await product.save();
    }
    console.log(`Updated ${products.length} product records`);
    
    // Update Notification images
    const notifications = await Notification.find({ image: { $regex: oldBaseUrl } });
    for (const notification of notifications) {
      if (notification.image && notification.image.includes(oldBaseUrl)) {
        notification.image = notification.image.replace(oldBaseUrl, newBaseUrl);
        await notification.save();
      }
    }
    console.log(`Updated ${notifications.length} notification records`);
    
    console.log("Image URL update completed successfully!");
    
  } catch (error) {
    console.error("Error updating image URLs:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the update
updateImageUrls();
