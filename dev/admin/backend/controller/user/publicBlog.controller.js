const BlogPost = require("../../models/blogPost.model");

exports.listPublished = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const category = (req.query.category || "").trim();
    const filter = { status: "published" };
    if (category) filter.category = category;
    const posts = await BlogPost.find(filter)
      .select(
        "title slug excerpt coverImage category tags authorName readingMinutes publishedAt seoTitle seoDescription"
      )
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return res.status(200).json({ status: true, posts });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    const post = await BlogPost.findOne({ slug, status: "published" })
      .populate("author", "name bio avatar")
      .lean();
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    return res.status(200).json({ status: true, post });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
