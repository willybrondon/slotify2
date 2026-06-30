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
