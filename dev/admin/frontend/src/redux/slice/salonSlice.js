import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";
import axios from "axios";

const initialState = {
  salon: [],
  booking: [],
  salonSchedule: [],
  salonOrders: [],
  salonProduct: [],
  isLoading: false,
  total: 0,
};

export const getAllSalons = createAsyncThunk(
  "admin/salon/getAll",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/salon/getAll?start=${payload?.start}&limit=${payload?.limit}&search=${payload?.search}`
    );
  }
);
export const getSalonDetail = createAsyncThunk(
  "admin/salon/getSalon",
  async (id) => {
    return apiInstanceFetch.get(`admin/salon/getSalon?salonId=${id}`);
  }
);
export const getSalonProductDetails = createAsyncThunk(
  "admin/getSalonProductDetails/getSalon",
  async (payload) => {
    return apiInstanceFetch.get(`admin/salon/getProductsOfParticularSalon?salonId=${payload?.salonId}&start=${payload?.start}&limit=${payload?.limit}`);
  }
);
export const getSalonOrderDetails = createAsyncThunk(
  "admin/getSalonOrderDetails/getSalon",
  async (payload) => {
    return apiInstanceFetch.get(`admin/order/fetchOrdersOfSalon?salonId=${payload?.salonId}&start=${payload?.start}&limit=${payload?.limit}&status=${payload?.status}`);
  }
);
export const getSalonReview = createAsyncThunk(
  "admin/review/salonReviews",
  async (id) => {
    return apiInstanceFetch.get(`admin/review/salonReviews?salonId=${id}`);
  }
);
export const salonReviewDelete = createAsyncThunk(
  "admin/review/delete",
  async (payload) => {
    return apiInstance.delete(`admin/review/delete?reviewId=${payload}`);
  }
);

export const getSalonSchedule = createAsyncThunk(
  "admin/salon/salonTime",
  async (payload) => {
    return apiInstanceFetch.get(`admin/salon/salonTime?salonId=${payload}`);
  }
);

export const updateSalonTime = createAsyncThunk(
  "admin/salon/updateSalonTime",
  async (payload) => {
    return axios.patch(
      `admin/salon/updateSalonTime?salonId=${payload?.id}&day=${payload?.day}`,
      payload?.data
    );
  }
);

export const addSalon = createAsyncThunk(
  "admin/salon/create",
  async (payload) => {
    return apiInstance.post(`admin/salon/create`, payload);
  }
);
export const updateSalon = createAsyncThunk(
  "admin/salon/update",
  async (payload) => {
    return axios.patch(
      `admin/salon/update?salonId=${payload?.salonId}`,
      payload?.formData
    );
  }
);

export const salonDelete = createAsyncThunk(
  "admin/salon/delete",
  async (payload) => {
    return apiInstance.delete(`admin/salon/delete?salonId=${payload}`);
  }
);

export const activesalon = createAsyncThunk(
  "admin/salon/isActive",
  async (id) => {
    return apiInstance.put(`admin/salon/isActive?salonId=${id}`);
  }
);
export const handleBestSeller = createAsyncThunk(
  "admin/handleBestSeller/update",
  async (id) => {
    return apiInstance.put(`admin/salon/isBestSeller?salonId=${id}`);
  }
);

export const activeBreak = createAsyncThunk(
  "admin/salon/isBreak",
  async (payload) => {
    return apiInstance.patch(
      `admin/salon/manageBreak?salonId=${payload?.id}&day=${payload?.day}`
    );
  }
);

export const getSalonBookings = createAsyncThunk(
  "admin/booking/getSalonBookings",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/booking/getSalonBookings?salonId=${payload?.salonId}&start=${payload?.start}&limit=${payload?.limit}&type=${payload?.type}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);
export const getSalonHistory = createAsyncThunk(
  "admin/settlement/particularSalon",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/settlement/particularSalon?salonId=${payload?.salonId}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

const salonSlice = createSlice({
  name: "salonSlice",
  initialState,
  reducers: {},
  // GetAll salon
  extraReducers: (builder) => {
    builder.addCase(getAllSalons.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getAllSalons.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.salon = action?.payload?.data;
    });

    builder.addCase(getAllSalons.rejected, (state, action) => {
      state.isSkeleton = false;
    });
    builder.addCase(getSalonOrderDetails.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonOrderDetails.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.salonOrders = action?.payload?.orders;
      state.total = action?.payload?.total
    });

    builder.addCase(getSalonOrderDetails.rejected, (state, action) => {
      state.isSkeleton = false;
    });
    builder.addCase(getSalonProductDetails.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonProductDetails.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.salonProduct = action?.payload?.product;
      state.total = action?.payload?.totalProducts;
    });

    builder.addCase(getSalonProductDetails.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(addSalon.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(addSalon.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.salon.unshift(action.payload?.data);
        state.total += 1;
        Success("Salon Create Successfully");
      }
      state.isLoading = false;
    });
    builder.addCase(addSalon.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateSalon.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(updateSalon.fulfilled, (state, action) => {
      if (action.payload.status) {
        const salonIdx = state?.salon?.findIndex(
          (salon) => salon?._id === action?.payload?.data?.data?._id
        );
        if (salonIdx !== -1) {
          state.salon[salonIdx] = {
            ...state.salon[salonIdx],
            ...action.payload.data.data,
          };
        }
        Success("salon Update Successfully");
      }
      state.isLoading = false;
    });
    builder.addCase(updateSalon.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(salonDelete.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(salonDelete.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.salon = state.salon.filter(
          (salon) => salon._id !== action.meta.arg
        );
        state.total -= 1;
        Success("Salon Delete Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(salonDelete.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getSalonSchedule.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonSchedule.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.salonSchedule = action?.payload?.salonTIme;
    });

    builder.addCase(getSalonSchedule.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(updateSalonTime.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(updateSalonTime.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.salonSchedule = action.payload.data.salonTime;
        Success("Time Update Successfully");
      }
      state.isLoading = false;
    });
    builder.addCase(updateSalonTime.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(activeBreak.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(activeBreak.fulfilled, (state, action) => {
      if (action.payload.status) {
        const activeSalonIndx = action.payload.salonDay;
        const salonIndx = state.salonSchedule.findIndex(
          (salon) => salon?._id === activeSalonIndx?._id
        );


        if (salonIndx !== -1) {
          state.salonSchedule[salonIndx].isBreak = activeSalonIndx.isBreak
        }
        Success("Salon Update Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(activeBreak.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(activesalon.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(activesalon.fulfilled, (state, action) => {
      if (action.payload.status) {
        const activeSalonIndx = action.payload.salon;
        const salonIndx = state.salon.findIndex(
          (salon) => salon?._id === activeSalonIndx?._id
        );
        if (salonIndx !== -1) {
          state.salon[salonIndx] = {
            ...state.salon[salonIndx],
            ...action.payload?.salon,
          };
        }
        Success("Salon Update Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(activesalon.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getSalonBookings.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonBookings.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.booking = action.payload.services;
      state.total = action.payload.total;
    });

    builder.addCase(getSalonBookings.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(getSalonDetail.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getSalonDetail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.salonDetail = action?.payload?.salon;
    });

    builder.addCase(getSalonDetail.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(getSalonReview.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getSalonReview.fulfilled, (state, action) => {
      state.isLoading = false;
      state.review = action?.payload?.data;
    });

    builder.addCase(getSalonReview.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(salonReviewDelete.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(salonReviewDelete.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.review = state.review?.filter(
          (review) => review?._id !== action?.meta?.arg
        );
      }
      state.isLoading = false;
    });

    builder.addCase(salonReviewDelete.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(getSalonHistory.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonHistory.fulfilled, (state, action) => {
      state.salary = action?.payload?.services;
      state.total = action?.payload?.total;
      state.isSkeleton = false;
    });

    builder.addCase(getSalonHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });
  },
});
export default salonSlice.reducer;
