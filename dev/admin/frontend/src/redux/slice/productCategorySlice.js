import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
  productCategory: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getAllProductCategory = createAsyncThunk(
  "admin/productCategory/getAll",
  async () => {
    return apiInstanceFetch.get("admin/productCategory/get");
  }
);

export const productCategoryAdd = createAsyncThunk(
  "admin/productCategory/create",
  async (payload) => {
    return apiInstance.post("admin/productCategory/create", payload);
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
export const productCategoryUpdate = createAsyncThunk(
  "admin/productCategory/update",
  async (id) => {
    return apiInstance.patch(
      `admin/productCategory/update?categoryId=${id?.id}`,
      id?.formData
    );
  }
);

const productCategorySLice = createSlice({
  name: "productCategorySLice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllProductCategory.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getAllProductCategory.fulfilled, (state, action) => {
      state.total = action.payload.total;
      state.productCategory = action.payload.data;
      state.isSkeleton = false;
    });

    builder.addCase(getAllProductCategory.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(productCategoryAdd.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(productCategoryAdd.fulfilled, (state, action) => {
      if (action.payload.status) {
        state?.productCategory?.unshift(action?.payload?.data);
        state.total += 1;
        // Success("ProductCategory Add Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(productCategoryAdd.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default productCategorySLice.reducer;
