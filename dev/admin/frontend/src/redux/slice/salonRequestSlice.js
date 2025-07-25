import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const initialState = {
  salonRequest: [],
  isLoading: false,
  isSkeleton: false,
};

export const getSalonRequest = createAsyncThunk(
  "admin/salonrequest/getallsalonRequest",
  async (payload) => {
    return apiInstance.get(`admin/salonrequest/getallsalonRequest`);
  }
);

export const attendExpert = createAsyncThunk(
  "admin/attendance/attendanceByAdmin",
  async (id) => {
    return apiInstance.post(
      `admin/attendance/attendanceByAdmin?expertId=${id}`
    );
  }
);

export const absentExpert = createAsyncThunk(
  "admin/attendance/addAbsentByAdmin",
  async (id) => {
    return apiInstance.post(`admin/attendance/addAbsentByAdmin?expertId=${id}`);
  }
);

const salonRequestSlice = createSlice({
  name: "attendanceSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSalonRequest.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonRequest.fulfilled, (state, action) => {
      state.salonRequest = action?.payload?.data;
      state.isSkeleton = false;
    });

    builder.addCase(getSalonRequest.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(attendExpert.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(attendExpert.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        state.attendance = action?.payload?.data;
        Success("Expert attendance Updated Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(attendExpert.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(absentExpert.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(absentExpert.fulfilled, (state, action) => {
      state.isLoading = false;
      state.attendance = action?.payload?.data;

      if (action?.payload?.status) {
        Success("Expert attendance Updated Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(absentExpert.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default salonRequestSlice.reducer;
