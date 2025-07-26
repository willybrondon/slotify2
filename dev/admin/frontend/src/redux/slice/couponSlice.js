import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
  coupon: [],
  isLoading: false,
};

export const getCoupon = createAsyncThunk(
  "admin/coupon/fetchCoupons",
  async () => {
    return apiInstance.get("admin/coupon/fetchCoupons");
  }
);

export const createCoupon = createAsyncThunk(
  "admin/coupon/couponGenerate",
  async (payload) => {
    return apiInstance.post("admin/coupon/couponGenerate", payload);
  }
);

export const deleteCoupon = createAsyncThunk(
  "admin/coupon/deleteCoupon",
  async (payload) => {
    return apiInstance.delete(`admin/coupon/deleteCoupon?couponId=${payload}`);
  }
);

export const activeCoupon = createAsyncThunk(
  "admin/coupon/toggleCouponStatus",
  async (payload) => {
    return apiInstance.patch(
      `admin/coupon/toggleCouponStatus?couponId=${payload}`
    );
  }
);

const couponSlice = createSlice({
  name: "couponSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCoupon.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCoupon.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action?.payload?.status) {
        state.coupon = action?.payload?.data;
      }
    });
    builder.addCase(getCoupon.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(createCoupon.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createCoupon.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action?.payload?.status) {
        state.coupon.push(action?.payload?.data);
        Success("Coupon Created Successfully");
      }
    });
    builder.addCase(createCoupon.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(deleteCoupon.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteCoupon.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action?.payload?.status) {
        state.coupon = state.coupon.filter(
          (coupon) => coupon._id !== action.meta.arg
        );
        Success("Coupon Deleted Successfully");
      }
    });
    builder.addCase(deleteCoupon.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(activeCoupon.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(activeCoupon.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action?.payload?.status) {
        const updatedCoupon = action?.payload?.data;
        state.coupon = state.coupon.map((coupon) =>
          coupon._id === updatedCoupon._id ? updatedCoupon : coupon
        );
      }
    });
    builder.addCase(activeCoupon.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default couponSlice.reducer;
