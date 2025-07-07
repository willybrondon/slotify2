/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
  expert: [],
  isLoading: false,
  isSkeleton: false,
  oneExpert: {},
  total: null,
};

export const getAllExpert = createAsyncThunk(
  "salon/expert/getAll",
  async (payload) => {
    return apiInstanceFetch.get(
      `salon/expert/getAll?start=${payload?.start}&limit=${payload?.limit}&search=${payload?.search}`
    );
  }
);

export const getExpert = createAsyncThunk(
  "salon/expert/profile",
  async (id) => {
    return apiInstanceFetch.get(`salon/expert/profile?expertId=${id}`);
  }
);

export const expertAdd = createAsyncThunk(
  "salon/expert/create",
  async (payload) => {
    return apiInstance.post("salon/expert/create", payload);
  }
);

export const expertUpdate = createAsyncThunk(
  "salon/expert/updateExpert",
  async (payload) => {
    return apiInstance.patch(
      `salon/expert/updateExpert?expertId=${payload?.expertId}`,
      payload?.formData
    );
  }
);

export const expertDelete = createAsyncThunk(
  "salon/expert/delete",
  async (id) => {
    return apiInstance.put(`salon/expert/delete?expertId=${id}`);
  }
);

export const verifyExpert = createAsyncThunk(
  "salon/expert/isVerify",
  async (id) => {
    return apiInstance.put(`salon/expert/isVerify?${id}`);
  }
);

export const blockExpert = createAsyncThunk(
  "salon/expert/isBlock",
  async (id) => {
    return apiInstance.put(`salon/expert/isBlock?expertId=${id}`);
  }
);

export const getExpertBookings = createAsyncThunk(
  "salon/booking/getExpertBookings",
  async (payload) => {
    return apiInstanceFetch.get(
      `salon/booking/getExpertBookings?expertId=${payload?.expertId}&start=${payload?.start}&limit=${payload?.limit}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
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
        state.oneExpert = action.payload.expert
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
      // state.isLoading = true;
    });

    builder.addCase(blockExpert.fulfilled, (state, action) => {
      if (action.payload.status) {
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
      // state.isLoading = false;
    });

    builder.addCase(blockExpert.rejected, (state, action) => {
      // state.isLoading = false;
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
