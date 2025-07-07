/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
  expert: [],
  isLoading: false,
  isSkeleton: false,
  oneExpert: {},
  booking: [],
  total: null,
};

export const getAllExpert = createAsyncThunk(
  "admin/expert/getAll",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/expert/getAll?salonId=${payload?.salonId}&start=${payload?.start}&limit=${payload?.limit}&search=${payload?.search}`
    );
  }
);

export const getExpert = createAsyncThunk(
  "admin/expert/profile",
  async (id) => {
    return apiInstanceFetch.get(`admin/expert/profile?expertId=${id}`);
  }
);

export const expertAdd = createAsyncThunk(
  "admin/expert/create",
  async (payload) => {
    return apiInstance.post("admin/expert/create", payload);
  }
);

export const expertUpdate = createAsyncThunk(
  "admin/expert/update",
  async (payload) => {
    return apiInstance.patch(
      `admin/expert/update?expertId=${payload?.expertId}`,
      payload?.formData
    );
  }
);

export const expertDelete = createAsyncThunk(
  "admin/expert/delete",
  async (id) => {
    return apiInstance.put(`admin/expert/delete?expertId=${id}`);
  }
);

export const verifyExpert = createAsyncThunk(
  "admin/expert/isVerify",
  async (id) => {
    return apiInstance.put(`admin/expert/isVerify?${id}`);
  }
);

export const blockExpert = createAsyncThunk(
  "admin/expert/isBlock",
  async (id) => {
    return apiInstance.put(`admin/expert/isBlock?expertId=${id}`);
  }
);

export const getExpertBookings = createAsyncThunk(
  "admin/booking/getExpertBookings",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/booking/getExpertBookings?expertId=${payload?.expertId}&start=${payload?.start}&limit=${payload?.limit}&type=${payload?.type}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

const expertSlice = createSlice({
  name: "expertSlice",
  initialState,
  reducers: {},
  // GetAll Expert
  extraReducers: (builder) => {
    builder.addCase(getAllExpert.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getAllExpert.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.expert = action?.payload?.experts;
      state.total = action?.payload?.total;
    });

    builder.addCase(getAllExpert.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(getExpert.pending, (state, action) => {
      state.isLoading = true;
    });


    builder.addCase(getExpert.fulfilled, (state, action) => {
      state.isLoading = false;
      state.oneExpert = action.payload?.experts;
    });

    builder.addCase(getExpert.rejected, (state, action) => {
      state.isLoading = false;
    });

    // add Expert

    builder.addCase(expertAdd.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(expertAdd.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.expert.unshift(action.payload?.expert);
        Success("Expert Create Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(expertAdd.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(expertUpdate.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(expertUpdate.fulfilled, (state, action) => {
      if (action.payload.status) {
        const expertIdx = state.expert.findIndex(
          (expert) => expert._id === action.payload.expert._id
        );
        if (expertIdx !== -1) {
          state.expert[expertIdx] = {
            ...state.expert[expertIdx],
            ...action.payload.expert,
          };
        }
        Success("Expert Update Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(expertUpdate.rejected, (state, action) => {
      state.isLoading = false;
    });

    // delete Expert

    builder.addCase(expertDelete.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(expertDelete.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.expert = state.expert.filter(
          (expert) => expert._id !== action.meta.arg
        );
        Success("Expert Delete Successfully");
      }
      state.isLoading = false;
    });
    builder.addCase(expertDelete.rejected, (state, action) => {
      state.isLoading = false;
    });

    // block unblock expert
    builder.addCase(blockExpert.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(blockExpert.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.isLoading = false;
        const updatedExpert = action.payload.expert;
        const expertIndex = state.expert.findIndex(
          (expert) => expert?._id === updatedExpert?._id
        );
        if (expertIndex !== -1) {
          state.expert[expertIndex] = {
            ...state.expert[expertIndex],
            ...action.payload?.expert,
          };
        }
        Success("Expert Update Successfully");
      }
    });
    builder.addCase(blockExpert.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getExpertBookings.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getExpertBookings.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.booking = action.payload.services;
      state.total = action.payload.total;
    });

    builder.addCase(getExpertBookings.rejected, (state, action) => {
      state.isSkeleton = false;
    });
  },
});
export default expertSlice.reducer;
