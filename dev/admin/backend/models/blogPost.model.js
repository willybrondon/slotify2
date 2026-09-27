const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, default: "", trim: true },
    contentHtml: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: {
      type: String,
      default: "guides",
      enum: ["guides", "coiffure", "salons", "app", "pro", "tendances", "autre"],
    },
    tags: [{ type: String, trim: true }],
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "pending", "published", "rejected"],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "BlogAdmin", required: true },
    authorName: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    publishedAt: { type: Date, default: null },
    readingMinutes: { type: Number, default: 3 },
  },
  { timestamps: true, versionKey: false }
);

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ author: 1, status: 1 });

module.exports = mongoose.model("BlogPost", blogPostSchema);
