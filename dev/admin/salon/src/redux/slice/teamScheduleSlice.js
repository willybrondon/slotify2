import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstanceFetch } from "../../component/api/axiosApi";

const initialState = {
  schedule: null,
  isLoading: false,
};

export const fetchTeamSchedule = createAsyncThunk(
  "teamSchedule/fetch",
  async ({ date, view = "day" }) => {
    return apiInstanceFetch.get(
      `salon/teamSchedule/get?date=${date}&view=${view}`
    );
  }
);

export const setExpertBusySlots = createAsyncThunk(
  "teamSchedule/setBusy",
  async ({ expertId, date, time }) => {
    return apiInstanceFetch.post("salon/teamSchedule/busy", { expertId, date, time });
  }
);

export const removeExpertBusySlots = createAsyncThunk(
  "teamSchedule/removeBusy",
  async ({ expertId, date, time }) => {
    return apiInstanceFetch.post("salon/teamSchedule/busy/remove", { expertId, date, time });
  }
);

export const searchPlanningClients = createAsyncThunk(
  "teamSchedule/searchClients",
  async (search) => {
    return apiInstanceFetch.get(
      `salon/teamSchedule/clients?search=${encodeURIComponent(search || "")}`
    );
  }
);

export const createPlanningBooking = createAsyncThunk(
  "teamSchedule/createBooking",
  async (payload) => {
    return apiInstanceFetch.post("salon/teamSchedule/booking", payload);
  }
);

export const reschedulePlanningBooking = createAsyncThunk(
  "teamSchedule/rescheduleBooking",
  async (payload) => {
    return apiInstanceFetch.post("salon/teamSchedule/booking/reschedule", payload);
  }
);

export const resizePlanningBooking = createAsyncThunk(
  "teamSchedule/resizeBooking",
  async (payload) => {
    return apiInstanceFetch.post("salon/teamSchedule/booking/resize", payload);
  }
);

export const fetchPlanningBookingDetail = createAsyncThunk(
  "teamSchedule/bookingDetail",
  async (bookingId) => {
    return apiInstanceFetch.get(
      `salon/teamSchedule/booking/detail?bookingId=${bookingId}`
    );
  }
);

export const cancelPlanningBooking = createAsyncThunk(
  "teamSchedule/cancelBooking",
  async ({ bookingId, reason }) => {
    return apiInstanceFetch.post("salon/teamSchedule/booking/cancel", { bookingId, reason });
  }
);

export const updatePlanningBookingServices = createAsyncThunk(
  "teamSchedule/updateServices",
  async ({ bookingId, serviceIds }) => {
    return apiInstanceFetch.post("salon/teamSchedule/booking/services", {
      bookingId,
      serviceIds,
    });
  }
);

const teamScheduleSlice = createSlice({
  name: "teamSchedule",
  initialState,
  reducers: {
    clearTeamSchedule: (state) => {
      state.schedule = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTeamSchedule.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTeamSchedule.fulfilled, (state, action) => {
      state.isLoading = false;
      state.schedule = action.payload?.data || null;
    });
    builder.addCase(fetchTeamSchedule.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { clearTeamSchedule } = teamScheduleSlice.actions;
export default teamScheduleSlice.reducer;
