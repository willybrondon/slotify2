import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
  salary: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getSalary = createAsyncThunk(
  "admin/settlementForAdmin",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/settlement/allSalon?start=${payload?.start}&limit=${payload?.limit}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&type=${payload?.type}`
    );
  }
);

export const bonusPenalty = createAsyncThunk(
  "admin/settlement/salonBonusPenalty",
  async (payload) => {
    return apiInstance.put(
      `admin/settlement/salonBonusPenalty?settlementId=${payload?.settlementId}`,
      payload?.data
    );
  }
);

export const payment = createAsyncThunk(
  "admin/settlement/salonPayment",
  async (payload) => {
    return apiInstance.put(
      `admin/settlement/salonPayment?settlementId=${payload.settlementId}`,
      payload.data
    );
  }
);

export const expertRevenue = createAsyncThunk(
  "admin/expert/expertEarningById",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/expert/expertEarningById?expertId=${payload.expertId}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&end=${payload?.end}`
    );
  }
);

export const expertHistory = createAsyncThunk(
  "admin/settlement/expertSettlementInfo",
  async (id) => {
    return apiInstanceFetch.get(
      `admin/settlement/expertSettlementInfo?settlementId=${id}`
    );
  }
);
export const particulareExpertHistory = createAsyncThunk(
  "admin/settlement/particularExpert",
  async (id) => {
    return apiInstanceFetch.get(
      `admin/settlement/particularExpert?expertId=${id}`
    );
  }
);
export const particulareSalonEarningHistory = createAsyncThunk(
  "admin/settlement/salonSettlementInfo",
  async (id) => {
    return apiInstanceFetch.get(
      `admin/settlement/salonSettlementInfo?settlementId=${id}`
    );
  }
);

export const monthlyState = createAsyncThunk(
  "admin/booking/monthlyState",
  async (payload) => {
    return apiInstanceFetch.get(`admin/booking/monthlyState?year=${payload}`);
  }
);

const salarySlice = createSlice({
  name: "salarySlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSalary.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getSalary.fulfilled, (state, action) => {
      state.salary = action?.payload?.services;
      state.isSkeleton = false;
    });

    builder.addCase(getSalary.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(expertHistory.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(expertHistory.fulfilled, (state, action) => {
      state.salary = action?.payload?.settlement?.bookingId;
      state.isSkeleton = false;
    });

    builder.addCase(expertHistory.rejected, (state, action) => {
      state.isSkeleton = false;
    });
    builder.addCase(particulareExpertHistory.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(particulareExpertHistory.fulfilled, (state, action) => {
      state.salary = action?.payload?.settlement;
      state.isSkeleton = false;
    });

    builder.addCase(particulareExpertHistory.rejected, (state, action) => {
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

    builder.addCase(expertRevenue.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(expertRevenue.fulfilled, (state, action) => {
      state.salary = action?.payload?.bookings;
      state.total = action?.payload?.total;
      state.isSkeleton = false;
    });

    builder.addCase(expertRevenue.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(bonusPenalty.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(bonusPenalty.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        const salaryIdx = state.salary.findIndex(
          (salary) => salary._id === action.payload?.settlement?._id
        );
        if (salaryIdx !== -1) {
          state.salary[salaryIdx] = {
            ...state?.salary[salaryIdx],
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
        const salaryIdx = state.salary.findIndex(
          (salary) => salary._id === action.payload?.settlement?._id
        );

        if (salaryIdx !== -1) {
          state.salary[salaryIdx] = {
            ...state?.salary[salaryIdx],
            ...action?.payload?.settlement,
          };
        }
      }
      state.isLoading = false;
      Success("Salary Paid Successfully");
    });

    builder.addCase(payment.rejected, (state, action) => {
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
  },
});
export default salarySlice.reducer;
