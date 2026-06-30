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
