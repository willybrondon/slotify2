const BlogPost = require("../../models/blogPost.model");

exports.list = async (req, res) => {
  try {
    const status = (req.query.status || "pending").trim();
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const posts = await BlogPost.find(filter)
      .populate("author", "name email")
      .sort({ updatedAt: -1 })
      .lean();
    return res.status(200).json({ status: true, posts });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate("author", "name email bio")
      .lean();
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    return res.status(200).json({ status: true, post });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.publish = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    post.status = "published";
    post.publishedAt = post.publishedAt || new Date();
    post.reviewedBy = req.admin?._id || null;
    post.reviewedAt = new Date();
    post.rejectionReason = "";
    await post.save();
    return res.status(200).json({ status: true, post, message: "Article publié" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    post.status = "rejected";
    post.rejectionReason = String(req.body.reason || req.body.rejectionReason || "").trim();
    post.reviewedBy = req.admin?._id || null;
    post.reviewedAt = new Date();
    await post.save();
    return res.status(200).json({ status: true, post, message: "Article refusé" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.unpublish = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    post.status = "draft";
    post.reviewedBy = req.admin?._id || null;
    post.reviewedAt = new Date();
    await post.save();
    return res.status(200).json({ status: true, post, message: "Article dépublié" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
