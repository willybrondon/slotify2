import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
  complain: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getComplains = createAsyncThunk(
  `user/complain/getComplains`,
  async (payload) => {
    return apiInstanceFetch.get(
      `user/complain/getComplains?type=${payload?.type}&start=${payload?.start}&limit=${payload?.limit}&person=${payload?.person}`
    );
  }
);

export const solveComplain = createAsyncThunk(
  `user/complain/solveComplain`,
  async (id) => {
    return apiInstanceFetch.put(`user/complain/solveComplain?id=${id}`);
  }
);

const categorySlice = createSlice({
  name: "categorySlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getComplains.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getComplains.fulfilled, (state, action) => {
      state.total = action.payload.total;
      state.complain = action.payload.data;
      state.isSkeleton = false;
    });

    builder.addCase(getComplains.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(solveComplain.fulfilled, (state, action) => {
      if (action.payload.status) {
        const updated = action?.payload?.complain;
        const complainIndex = state?.complain?.findIndex(
          (complain) => complain?._id === updated?._id
        );
        if (complainIndex !== -1) {
          state.complain[complainIndex].type = updated?.type;
        }
        Success("Complain Solved Succefully");
      }
      state.isLoading = false;
    });

  },
});
export default categorySlice.reducer;
