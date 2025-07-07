import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
  user: [],
  userProfile: {},
  booking: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
  history: [],
};

export const allUsers = createAsyncThunk(
  "admin/user/getAll",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/user/getAll?start=${payload?.start}&limit=${payload?.limit}&search=${payload?.search}`
    );
  }
);

export const getUser = createAsyncThunk(
  "admin/user/profile",
  async (payload) => {
    return apiInstanceFetch.get(`admin/user/profile?userId=${payload}`);
  }
);

export const blockUser = createAsyncThunk(
  "admin/user/blockUnblock",
  async (id) => {
    return apiInstance.put(`admin/user/blockUnblock?userId=${id}`);
  }
);

export const getUserBookings = createAsyncThunk(
  "admin/booking/getUserBookings",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/booking/getUserBookings?userId=${payload?.userId}&start=${payload?.start}&limit=${payload?.limit}&type=${payload?.type}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(allUsers.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(allUsers.fulfilled, (state, action) => {
      state.user = action.payload.users;
      state.total = action?.payload?.total;
      state.isSkeleton = false;
    });

    builder.addCase(allUsers.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(getUser.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getUser.fulfilled, (state, action) => {
      state.userProfile = action?.payload?.user;
      state.isLoading = false;
    });

    builder.addCase(getUser.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(blockUser.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(blockUser.fulfilled, (state, action) => {
      if (action.payload.status) {
        const updatedUser = action?.payload?.user;
        const userIndex = state?.user?.findIndex(
          (user) => user?._id === updatedUser?._id
        );
        if (userIndex !== -1) {
          state.user[userIndex].isBlock = updatedUser?.isBlock;
        }
        Success("Updated Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(blockUser.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getUserBookings.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getUserBookings.fulfilled, (state, action) => {
      state.isSkeleton = false;
      state.booking = action.payload.services;
      state.total = action.payload.total;
    });

    builder.addCase(getUserBookings.rejected, (state, action) => {
      state.isSkeleton = false;
    });
  },
});
export default userSlice.reducer;
