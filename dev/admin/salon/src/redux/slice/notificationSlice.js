import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
  notification: [],
  total: null,
  isLoading: false,
  isSkeleton: false,
};
export const userNotification = createAsyncThunk(
  "salon/notification/toOneUser",
  async (payload) => {
    
    return apiInstance.post(
      `salon/notification/toOneUser?userId=${payload?.userId}`,
      payload?.data
    );
  }
);

export const expertNotification = createAsyncThunk(
  "salon/notification/toExpert",
  async (payload) => {

    return apiInstance.post(
      `salon/notification/toExpert?expertId=${payload?.expertId}`,
      payload?.data
    );
  }
);

export const allUserNotification = createAsyncThunk(
  "salon/notification/notifyAllUsers",
  async (payload) => {
    return apiInstance.post(
      "salon/notification/notifyAllUsers",
      payload
    );
  }
);

const notificationSlice = createSlice({
  name: "payoutSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(userNotification.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(userNotification.fulfilled, (state, action) => {
      if (action?.payload.status) {
        state.notification = action?.payload?.notification;
        Success("Notification Send SuccessFully");
      }
      state.isLoading = false;
    });

    builder.addCase(userNotification.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(expertNotification.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(expertNotification.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        state.notification = action?.payload?.notification;
        Success("Notification Send SuccessFully");
      }
      state.isLoading = false;
    });

    builder.addCase(expertNotification.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(allUserNotification.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(allUserNotification.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        Success("Notification Send SuccessFully");
      }
      state.isLoading = false;
    });

    builder.addCase(allUserNotification.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});

export default notificationSlice.reducer;
