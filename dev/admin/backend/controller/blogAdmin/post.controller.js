const BlogPost = require("../../models/blogPost.model");

function slugify(title) {
  return String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function estimateReadingMinutes(html) {
  const text = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

async function uniqueSlug(base, excludeId) {
  let slug = slugify(base) || `article-${Date.now()}`;
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await BlogPost.findOne(q).select("_id").lean();
    if (!exists) return candidate;
    n += 1;
  }
}

exports.listMine = async (req, res) => {
  try {
    const status = (req.query.status || "").trim();
    const filter = { author: req.blogAdmin._id };
    if (status && status !== "all") filter.status = status;
    const posts = await BlogPost.find(filter).sort({ updatedAt: -1 }).lean();
    return res.status(200).json({ status: true, posts });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      _id: req.params.id,
      author: req.blogAdmin._id,
    }).lean();
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    return res.status(200).json({ status: true, post });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(200).json({ status: false, message: "Titre requis" });
    }
    const contentHtml = String(req.body.contentHtml || "");
    const slug = await uniqueSlug(req.body.slug || title);
    const post = await BlogPost.create({
      title,
      slug,
      excerpt: String(req.body.excerpt || "").trim(),
      contentHtml,
      coverImage: String(req.body.coverImage || "").trim(),
      category: req.body.category || "guides",
      tags: Array.isArray(req.body.tags)
        ? req.body.tags.map(String).map((t) => t.trim()).filter(Boolean)
        : String(req.body.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      seoTitle: String(req.body.seoTitle || title).trim(),
      seoDescription: String(req.body.seoDescription || req.body.excerpt || "").trim(),
      status: "draft",
      author: req.blogAdmin._id,
      authorName: req.blogAdmin.name || req.blogAdmin.email,
      readingMinutes: estimateReadingMinutes(contentHtml),
    });
    return res.status(201).json({ status: true, post });
  } catch (error) {
    console.error("[blogAdmin.create]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      _id: req.params.id,
      author: req.blogAdmin._id,
    });
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    if (post.status === "published") {
      return res.status(200).json({
        status: false,
        message: "Article publié : créez une nouvelle version ou contactez l'admin.",
      });
    }

    if (req.body.title != null) post.title = String(req.body.title).trim();
    if (req.body.excerpt != null) post.excerpt = String(req.body.excerpt).trim();
    if (req.body.contentHtml != null) {
      post.contentHtml = String(req.body.contentHtml);
      post.readingMinutes = estimateReadingMinutes(post.contentHtml);
    }
    if (req.body.coverImage != null) post.coverImage = String(req.body.coverImage).trim();
    if (req.body.category != null) post.category = req.body.category;
    if (req.body.tags != null) {
      post.tags = Array.isArray(req.body.tags)
        ? req.body.tags.map(String).map((t) => t.trim()).filter(Boolean)
        : String(req.body.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }
    if (req.body.seoTitle != null) post.seoTitle = String(req.body.seoTitle).trim();
    if (req.body.seoDescription != null) {
      post.seoDescription = String(req.body.seoDescription).trim();
    }
    if (req.body.slug != null && String(req.body.slug).trim()) {
      post.slug = await uniqueSlug(req.body.slug, post._id);
    }

    // Editing a rejected post returns it to draft
    if (post.status === "rejected") {
      post.status = "draft";
      post.rejectionReason = "";
    }

    await post.save();
    return res.status(200).json({ status: true, post });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.submitForReview = async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      _id: req.params.id,
      author: req.blogAdmin._id,
    });
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    if (!post.title || !post.contentHtml || post.contentHtml.replace(/<[^>]+>/g, "").trim().length < 40) {
      return res.status(200).json({
        status: false,
        message: "Ajoutez un titre et un contenu suffisant avant envoi.",
      });
    }
    if (post.status === "published") {
      return res.status(200).json({ status: false, message: "Déjà publié." });
    }
    post.status = "pending";
    post.rejectionReason = "";
    await post.save();
    return res.status(200).json({ status: true, post, message: "Envoyé pour validation admin." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      _id: req.params.id,
      author: req.blogAdmin._id,
    });
    if (!post) {
      return res.status(404).json({ status: false, message: "Article introuvable" });
    }
    if (post.status === "published") {
      return res.status(200).json({
        status: false,
        message: "Impossible de supprimer un article publié.",
      });
    }
    await post.deleteOne();
    return res.status(200).json({ status: true, message: "Article supprimé" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
