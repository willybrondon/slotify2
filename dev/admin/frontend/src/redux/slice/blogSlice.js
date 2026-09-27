import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
  authors: [],
  posts: [],
  currentPost: null,
  isLoading: false,
};

export const getBlogAuthors = createAsyncThunk("admin/blogAdmin/getAll", async () =>
  apiInstance.get("admin/blogAdmin/getAll")
);

export const createBlogAuthor = createAsyncThunk(
  "admin/blogAdmin/create",
  async (payload) => apiInstance.post("admin/blogAdmin/create", payload)
);

export const updateBlogAuthor = createAsyncThunk(
  "admin/blogAdmin/update",
  async ({ id, ...payload }) =>
    apiInstance.put(`admin/blogAdmin/update/${id}`, payload)
);

export const deleteBlogAuthor = createAsyncThunk(
  "admin/blogAdmin/delete",
  async (id) => apiInstance.delete(`admin/blogAdmin/delete/${id}`)
);

export const getBlogPosts = createAsyncThunk(
  "admin/blogPost/getAll",
  async (status = "pending") =>
    apiInstance.get(`admin/blogPost/getAll?status=${encodeURIComponent(status)}`)
);

export const getBlogPost = createAsyncThunk("admin/blogPost/get", async (id) =>
  apiInstance.get(`admin/blogPost/get/${id}`)
);

export const publishBlogPost = createAsyncThunk(
  "admin/blogPost/publish",
  async (id) => apiInstance.put(`admin/blogPost/publish/${id}`)
);

export const rejectBlogPost = createAsyncThunk(
  "admin/blogPost/reject",
  async ({ id, reason }) =>
    apiInstance.put(`admin/blogPost/reject/${id}`, { reason })
);

export const unpublishBlogPost = createAsyncThunk(
  "admin/blogPost/unpublish",
  async (id) => apiInstance.put(`admin/blogPost/unpublish/${id}`)
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearCurrentPost(state) {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBlogAuthors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogAuthors.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.status) state.authors = action.payload.authors || [];
      })
      .addCase(getBlogAuthors.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(createBlogAuthor.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success("Auteur créé");
          if (action.payload.author) state.authors.unshift(action.payload.author);
        }
      })
      .addCase(updateBlogAuthor.fulfilled, (state, action) => {
        if (action.payload?.status && action.payload.author) {
          Success("Auteur mis à jour");
          state.authors = state.authors.map((a) =>
            a._id === action.payload.author._id ? action.payload.author : a
          );
        }
      })
      .addCase(deleteBlogAuthor.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success("Auteur désactivé");
        }
      })
      .addCase(getBlogPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.status) state.posts = action.payload.posts || [];
      })
      .addCase(getBlogPosts.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getBlogPost.fulfilled, (state, action) => {
        if (action.payload?.status) state.currentPost = action.payload.post;
      })
      .addCase(publishBlogPost.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success(action.payload.message || "Publié");
          const p = action.payload.post;
          state.posts = state.posts.map((x) => (x._id === p._id ? p : x));
          state.currentPost = p;
        }
      })
      .addCase(rejectBlogPost.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success(action.payload.message || "Refusé");
          const p = action.payload.post;
          state.posts = state.posts.map((x) => (x._id === p._id ? p : x));
          state.currentPost = p;
        }
      })
      .addCase(unpublishBlogPost.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success(action.payload.message || "Dépublié");
          const p = action.payload.post;
          state.posts = state.posts.map((x) => (x._id === p._id ? p : x));
          state.currentPost = p;
        }
      });
  },
});

export const { clearCurrentPost } = blogSlice.actions;
export default blogSlice.reducer;
