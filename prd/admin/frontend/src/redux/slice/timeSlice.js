/* eslint-disable no-use-before-define */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
  time: [],
  isLoading: false,
  isSkeleton: false,
  holiday: [],
};

export const getSalonTime = createAsyncThunk(
  "admin/salontime/getAll",
  async () => {
    return apiInstanceFetch.get("admin/salontime/getAll");
  }
);

export const addSalonTime = createAsyncThunk(
  "admin/salontime",
  async (payload) => {
    return apiInstance.post("admin/salontime", payload);
  }
);

export const updateSalonTime = createAsyncThunk(
  "admin/salontime/update",
  async (payload) => {
    return apiInstance.patch(
      `admin/salontime/update/${payload?.id}`,
      payload?.data
    );
  }
);

export const timeActive = createAsyncThunk(
  "admin/salontime/isActive",
  async (id) => {
    return apiInstance.put(`admin/salontime/isActive?salonTimeId=${id}`);
  }
);



const timeSlice = createSlice({
  name: "timeSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSalonTime.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonTime.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.time = action.payload.salonTime;
    });

    builder.addCase(getSalonTime.rejected, (state, action) => {
      state.isSkeleton = false;
    });
    builder.addCase(addSalonTime.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(addSalonTime.fulfilled, (state, action) => {
      state.time.unshift(action.payload.salonTime);
      state.isLoading = false;
    });

    builder.addCase(addSalonTime.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateSalonTime.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(updateSalonTime.fulfilled, (state, action) => {
      if (action.payload.status) {
        const updatedTime = action?.payload?.salonTime;
        const timeIndex = state.time.findIndex(
          (saloon) => saloon?._id === updatedTime?._id
        );
        if (timeIndex !== -1) {
          state.time[timeIndex] = {
            ...state.time[timeIndex],
            ...action.payload.salonTime,
          };
        }
        Success("Updated Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(updateSalonTime.rejected, (state, action) => {
      state.isLoading = false;
      console.error("Error occurred while adding salon time:", action.error);
      DangerRight(action.message);
    });

    builder.addCase(timeActive.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(timeActive.fulfilled, (state, action) => {
      if (action.payload.status) {
        const updatedTime = action?.payload?.salonTime;
        const timeIndex = state.time.findIndex(
          (saloon) => saloon?._id === updatedTime?._id
        );
        if (timeIndex !== -1) {
          state.time[timeIndex] = {
            ...state.time[timeIndex],
            ...action.payload.salonTime,
          };
        }
        Success("Updated Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(timeActive.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default timeSlice.reducer;
