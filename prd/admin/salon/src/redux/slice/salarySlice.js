import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import {  Success } from "../../component/api/toastServices";

const initialState = {
  salary: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getSalonEarning = createAsyncThunk(
  "salon/settlement",
  async (payload) => {
    return apiInstanceFetch.get(
      `salon/settlement?start=${payload?.start}&limit=${payload?.limit}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);



export const Salonpayment = createAsyncThunk(
  "expert/expertSettlement/update",
  async (payload) => {
    return apiInstance.patch(
      `expert/expertSettlement/update?expertId=${payload.expertId}&month=${payload?.month}`,
      payload.data
    );
  }
);

export const expertRevenue = createAsyncThunk(
  "salon/settlement/particularExpert",
  async (payload) => {
    return apiInstanceFetch.get(
      `salon/settlement/particularExpert?expertId=${payload.expertId}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&limit=${payload?.limit}`
    );
  }
);

export const particulareSalonEarningHistory = createAsyncThunk(
  "salon/settlement/salonSettlementInfo",
  async (id) => {
    return apiInstanceFetch.get(
      `salon/settlement/salonSettlementInfo?settlementId=${id}`
    );
  }
);
export const particulareExpertSettlementInfo = createAsyncThunk(
  "salon/settlement/expertSettlementInfo",
  async (id) => {
    return apiInstanceFetch.get(
      `salon/settlement/expertSettlementInfo?settlementId=${id}`
    );
  }
);

export const expertHistory = createAsyncThunk(
  "expert/expertSettlement/getForExpert",
  async (id) => {
    return apiInstanceFetch.get(
      `expert/expertSettlement/getForExpert?expertId=${id}`
    );
  }
);

export const monthlyState = createAsyncThunk("salon/booking/monthlyState", async () => {
  return apiInstanceFetch.get(`salon/booking/monthlyState`);
});

const salarySlice = createSlice({
  name: "salarySlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSalonEarning.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalonEarning.fulfilled, (state, action) => {
      state.salary = action?.payload?.data;
      state.total  = action?.payload?.total
      state.isSkeleton = false;
    });

    builder.addCase(getSalonEarning.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(expertHistory.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(expertHistory.fulfilled, (state, action) => {
      state.salary = action?.payload?.settlement;
      state.isSkeleton = false;
    });

    builder.addCase(expertHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(expertRevenue.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(expertRevenue.fulfilled, (state, action) => {
      state.salary = action?.payload?.settlement;
      state.total = action?.payload?.total;
      state.isSkeleton = false;
    });

    builder.addCase(expertRevenue.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    
    builder.addCase(Salonpayment.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(Salonpayment.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        const salaryIdx = state.salary.findIndex(
          (salary) => salary._id === action.payload?.history?._id
        );
        if (salaryIdx !== -1) {
          state.salary[salaryIdx] = {
            ...state?.salary[salaryIdx],
            ...action?.payload?.history,
          };
        }
      }
      state.isLoading = false;
      Success("Salary Paid Successfully");
    });

    builder.addCase(Salonpayment.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(monthlyState.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(monthlyState.fulfilled, (state, action) => {
      state.salary = action?.payload?.result;
      state.total = action?.payload?.total;
      
      state.isSkeleton = false;
    });

    builder.addCase(monthlyState.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(particulareSalonEarningHistory.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(particulareSalonEarningHistory.fulfilled, (state, action) => {
      state.salary = action?.payload?.settlement?.bookingId;
      state.isSkeleton = false;
    });

    builder.addCase(particulareSalonEarningHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });
    builder.addCase(particulareExpertSettlementInfo.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(particulareExpertSettlementInfo.fulfilled, (state, action) => {
      state.salary = action?.payload?.settlement?.bookingId;
      state.isSkeleton = false;
    });

    builder.addCase(particulareExpertSettlementInfo.rejected, (state, action) => {
      state.isSkeleton = false;
    });

  },
});
export default salarySlice.reducer;
