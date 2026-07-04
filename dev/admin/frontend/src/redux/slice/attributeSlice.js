import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";
import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";

const initialState = {
  attributes: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getAllAttributes = createAsyncThunk(
  "admin/attributes/getAll",
  async () => {
    return apiInstanceFetch.get("admin/attributes");
  }
);

export const attributeAdd = createAsyncThunk(
  "admin/attributes/create",
  async (payload) => {
    return apiInstanceFetch.post("admin/attributes/create", payload);
  }
);

export const productCategoryStatus = createAsyncThunk(
  "admin/productCategory/status",
  async (id) => {
    return apiInstance.patch(
      `admin/productCategory/isActive?productCategoryId=${id}`
    );
  }
);
export const attributeUpdate = createAsyncThunk(
  "admin/attributes/update",
  async (data) => {
    return apiInstanceFetch.patch(
      `admin/attributes/update?attributesId=${data?.id}`,
      { name: data.name, value: data.value }
    );
  }
);

const attributeSlice = createSlice({
  name: "attributeSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllAttributes.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getAllAttributes.fulfilled, (state, action) => {
      state.total = action.payload.total;
      state.attributes = action.payload.attributes;
      state.isSkeleton = false;
    });

    builder.addCase(getAllAttributes.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(attributeAdd.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(attributeAdd.fulfilled, (state, action) => {
      if (action.payload?.status) {
        const created = action.payload?.attributes || action.payload?.data;
        if (created) {
          state.attributes.unshift(created);
        }
        state.total = (state.total || 0) + 1;
        Success(ui.toast.attributeAdded);
      }
      state.isLoading = false;
    });

    builder.addCase(attributeAdd.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(attributeUpdate.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(attributeUpdate.fulfilled, (state, action) => {
      if (action.payload?.status) {
        const updated = action.payload?.attributes || action.payload?.data;
        if (updated?._id) {
          const idx = state.attributes.findIndex((a) => a._id === updated._id);
          if (idx !== -1) {
            state.attributes[idx] = updated;
          }
        }
        Success(ui.toast.attributeUpdated);
      }
      state.isLoading = false;
    });

    builder.addCase(attributeUpdate.rejected, (state) => {
      state.isLoading = false;
    });
  },
});
export default attributeSlice.reducer;
