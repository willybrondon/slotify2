import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import {
  clearCurrentPost,
  getBlogPost,
  getBlogPosts,
  publishBlogPost,
  rejectBlogPost,
  unpublishBlogPost,
} from "../../../redux/slice/blogSlice";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";

const STATUS_LABEL = {
  draft: "Brouillon",
  pending: "En attente",
  published: "Publié",
  rejected: "Refusé",
};

const BlogPosts = () => {
  const dispatch = useDispatch();
  const { posts, currentPost, isLoading } = useSelector((s) => s.blog);
  const [status, setStatus] = useState("pending");
  const [reason, setReason] = useState("");

  useEffect(() => {
    dispatch(getBlogPosts(status));
    dispatch(clearCurrentPost());
  }, [dispatch, status]);

  const open = (id) => {
    setReason("");
    dispatch(getBlogPost(id));
  };

  return (
    <div className="mainAdminContent">
      <Title name={ui.nav.blogPosts || "Articles blog"} />
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {["pending", "published", "rejected", "draft", "all"].map((s) => (
          <button
            key={s}
            type="button"
            className={`btn btn-sm ${status === s ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "Tous" : STATUS_LABEL[s] || s}
          </button>
        ))}
      </div>
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card p-3">
            {isLoading ? <p>Chargement…</p> : null}
            <div className="list-group list-group-flush">
              {(posts || []).map((p) => (
                <button
                  key={p._id}
                  type="button"
                  className={`list-group-item list-group-item-action ${
                    currentPost?._id === p._id ? "active" : ""
                  }`}
                  onClick={() => open(p._id)}
                >
                  <div className="fw-semibold">{p.title}</div>
                  <small>
                    {STATUS_LABEL[p.status] || p.status} ·{" "}
                    {p.author?.name || p.authorName || "—"}
                  </small>
                </button>
              ))}
              {!posts?.length && !isLoading ? (
                <p className="text-muted mb-0">Aucun article dans ce filtre.</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card p-3">
            {!currentPost ? (
              <p className="text-muted mb-0">Sélectionnez un article à valider.</p>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h4 className="mb-1">{currentPost.title}</h4>
                    <p className="text-muted mb-0">
                      {STATUS_LABEL[currentPost.status]} ·{" "}
                      {currentPost.author?.email || currentPost.authorName} · /
                      blog/{currentPost.slug}
                    </p>
                  </div>
                  {currentPost.status === "published" ? (
                    <a
                      href={`/blog/${currentPost.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Voir live
                    </a>
                  ) : null}
                </div>
                {currentPost.coverImage ? (
                  <img
                    src={currentPost.coverImage}
                    alt=""
                    style={{
                      maxWidth: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  />
                ) : null}
                <p className="fst-italic">{currentPost.excerpt}</p>
                <div
                  className="border rounded p-3 mb-3 bg-white"
                  style={{ maxHeight: 420, overflow: "auto" }}
                  dangerouslySetInnerHTML={{ __html: currentPost.contentHtml || "" }}
                />
                <div className="d-flex flex-wrap gap-2 align-items-start">
                  {(currentPost.status === "pending" ||
                    currentPost.status === "draft" ||
                    currentPost.status === "rejected") && (
                    <Button
                      text="Publier"
                      className="bg-theme text-light"
                      onClick={() =>
                        dispatch(publishBlogPost(currentPost._id)).then(() =>
                          dispatch(getBlogPosts(status))
                        )
                      }
                    />
                  )}
                  {currentPost.status === "published" && (
                    <Button
                      text="Dépublier"
                      className="btn-secondary"
                      onClick={() =>
                        dispatch(unpublishBlogPost(currentPost._id)).then(() =>
                          dispatch(getBlogPosts(status))
                        )
                      }
                    />
                  )}
                  {currentPost.status !== "rejected" &&
                    currentPost.status !== "published" && (
                      <div className="d-flex gap-2 flex-grow-1 flex-wrap">
                        <input
                          className="form-control"
                          style={{ minWidth: 180 }}
                          placeholder="Motif du refus"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <Button
                          text="Refuser"
                          className="btn-danger"
                          onClick={() =>
                            dispatch(
                              rejectBlogPost({
                                id: currentPost._id,
                                reason,
                              })
                            ).then(() => dispatch(getBlogPosts(status)))
                          }
                        />
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPosts;
