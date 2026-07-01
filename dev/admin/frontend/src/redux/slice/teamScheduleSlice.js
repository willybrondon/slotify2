import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstanceFetch } from "../../component/api/axiosApi";

const initialState = {
  schedule: null,
  isLoading: false,
};

export const fetchAdminTeamSchedule = createAsyncThunk(
  "adminTeamSchedule/fetch",
  async ({ salonId, date, view = "day" }) => {
    return apiInstanceFetch.get(
      `admin/teamSchedule/get?salonId=${salonId}&date=${date}&view=${view}`
    );
  }
);

export const searchAdminPlanningClients = createAsyncThunk(
  "adminTeamSchedule/searchClients",
  async (search) => {
    return apiInstanceFetch.get(
      `admin/teamSchedule/clients?search=${encodeURIComponent(search || "")}`
    );
  }
);

export const createAdminPlanningBooking = createAsyncThunk(
  "adminTeamSchedule/createBooking",
  async (payload) => {
    return apiInstanceFetch.post("admin/teamSchedule/booking", payload);
  }
);

export const rescheduleAdminPlanningBooking = createAsyncThunk(
  "adminTeamSchedule/rescheduleBooking",
  async (payload) => {
    return apiInstanceFetch.post("admin/teamSchedule/booking/reschedule", payload);
  }
);

export const resizeAdminPlanningBooking = createAsyncThunk(
  "adminTeamSchedule/resizeBooking",
  async (payload) => {
    return apiInstanceFetch.post("admin/teamSchedule/booking/resize", payload);
  }
);

export const fetchAdminPlanningBookingDetail = createAsyncThunk(
  "adminTeamSchedule/bookingDetail",
  async ({ salonId, bookingId }) => {
    return apiInstanceFetch.get(
      `admin/teamSchedule/booking/detail?salonId=${salonId}&bookingId=${bookingId}`
    );
  }
);

export const cancelAdminPlanningBooking = createAsyncThunk(
  "adminTeamSchedule/cancelBooking",
  async ({ salonId, bookingId, reason }) => {
    return apiInstanceFetch.post("admin/teamSchedule/booking/cancel", {
      salonId,
      bookingId,
      reason,
    });
  }
);

export const updateAdminPlanningBookingServices = createAsyncThunk(
  "adminTeamSchedule/updateServices",
  async ({ salonId, bookingId, serviceIds }) => {
    return apiInstanceFetch.post("admin/teamSchedule/booking/services", {
      salonId,
      bookingId,
      serviceIds,
    });
  }
);

const adminTeamScheduleSlice = createSlice({
  name: "adminTeamSchedule",
  initialState,
  reducers: {
    clearAdminTeamSchedule: (state) => {
      state.schedule = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminTeamSchedule.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAdminTeamSchedule.fulfilled, (state, action) => {
      state.isLoading = false;
      state.schedule = action.payload?.data || null;
    });
    builder.addCase(fetchAdminTeamSchedule.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { clearAdminTeamSchedule } = adminTeamScheduleSlice.actions;
export default adminTeamScheduleSlice.reducer;
