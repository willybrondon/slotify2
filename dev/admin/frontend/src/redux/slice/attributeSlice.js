import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

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
    return apiInstance.post("admin/attributes/create", payload);
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
  async ( data ) => {
    return apiInstance.patch(
      `admin/attributes/update?attributesId=${data?.id}`,
      data
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
      if (action.payload.status) {
        state?.productCategory?.unshift(action?.payload?.data);
        state.total += 1;
        Success("ProductCategory Add Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(attributeAdd.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default attributeSlice.reducer;
