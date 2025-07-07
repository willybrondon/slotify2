import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
  payout: [],
  total: null,
  isLoading: false,
  isSkeleton: false,
};

export const getExpertEarning = createAsyncThunk(
  "salon/settlement/getExpertSettlement",
  async (payload) => {
    return apiInstanceFetch.get(
      `salon/settlement/getExpertSettlement?startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

export const yearlyPaymentHistory = createAsyncThunk(
  "salon/payment/yearWisePayment",
  async (year) => {
    return apiInstanceFetch.get(`salon/payment/yearWisePayment?year=${year}`);
  }
);
export const bonusPenalty = createAsyncThunk(
  "salon/settlement/expertBonusPenalty",
  async (payload) => {
    return apiInstance.put(
      `salon/settlement/expertBonusPenalty?settlementId=${payload?.settlementId}`,
      payload?.data
    );
  }
);
export const payment = createAsyncThunk(
  "salon/settlement/expertPayment",
  async (payload) => {
    return apiInstance.put(
      `salon/settlement/expertPayment?settlementId=${payload.settlementId}`,
      payload.data
    );
  }
);

const payoutSlice = createSlice({
  name: "payoutSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getExpertEarning.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getExpertEarning.fulfilled, (state, action) => {
      state.payout = action?.payload?.settlement;
      state.isSkeleton = false;
    });

    builder.addCase(getExpertEarning.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(yearlyPaymentHistory.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(yearlyPaymentHistory.fulfilled, (state, action) => {
      state.payout = action?.payload?.data;
      state.isSkeleton = false;
    });

    builder.addCase(yearlyPaymentHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(bonusPenalty.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(bonusPenalty.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        const salaryIdx = state.payout.findIndex(
          (salary) => salary._id === action.payload?.settlement?._id
        );

        if (salaryIdx !== -1) {
          state.payout[salaryIdx] = {
            ...state?.payout[salaryIdx],
            ...action?.payload?.settlement,
          };
        }
      }
      state.isLoading = false;
      Success("Bonus-Penalty Update Successfully");
    });

    builder.addCase(bonusPenalty.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(payment.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(payment.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        const salaryIdx = state.payout.findIndex(
          (salary) => salary._id === action.payload?.settlement?._id
        );

        if (salaryIdx !== -1) {
          state.payout[salaryIdx] = {
            ...state?.payout[salaryIdx],
            ...action?.payload?.settlement,
          };
        }
      }
      state.isLoading = false;
      Success("Expert Paid  Successfully");
    });

    builder.addCase(payment.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});

export default payoutSlice.reducer;
