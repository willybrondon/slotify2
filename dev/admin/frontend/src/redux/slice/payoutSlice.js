import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight,Success } from "../../component/api/toastServices";

const initialState = {
    payout: [],
    total:null,
    isLoading: false,
    isSkeleton: false,
}

export const getPayout = createAsyncThunk("admin/settlement/allExpert", async (payload) => {
    return apiInstanceFetch.get(`admin/settlement/allExpert?startDate=${payload?.startDate}&endDate=${payload?.endDate}&type=${payload?.type}`);
})

export const getAllPaymentHistory = createAsyncThunk("admin/payment/allPayment", async (payload) => {
    return apiInstanceFetch.get(`admin/payment/allPayment?month=${payload?.month}&start=${payload?.start}&limit=${payload?.limit}`);
})

export const particularPaymentHistory = createAsyncThunk("admin/payment/particularPaymentHistory", async (payload) => {
    
    return apiInstanceFetch.get(`admin/payment/particularPaymentHistory?settlementIds=${payload?.settlementIds}&expertId=${payload?.expertId}`);
})

export const yearlyPaymentHistory = createAsyncThunk("admin/payment/yearWisePayment", async (year) => {
    
    return apiInstanceFetch.get(`admin/payment/yearWisePayment?year=${year}`);
})

export const getExpertEarningBySalon = createAsyncThunk(
    "admin/settlement/expertBySalon",
    async (payload) => {
        return apiInstanceFetch.get(
            `admin/settlement/expertBySalon?salonId=${payload.salonId}&startDate=${payload.startDate}&endDate=${payload.endDate}`
        );
    }
);

export const paymentExpertBySalon = createAsyncThunk(
    "admin/settlement/expertPayment",
    async (payload) => {
        return apiInstance.put(
            `admin/settlement/expertPayment?settlementId=${payload.settlementId}&salonId=${payload.salonId}`,
            payload.data || {}
        );
    }
);

export const bonusPenaltyExpertBySalon = createAsyncThunk(
    "admin/settlement/expertBonusPenalty",
    async (payload) => {
        return apiInstance.put(
            `admin/settlement/expertBonusPenalty?settlementId=${payload.settlementId}&salonId=${payload.salonId}`,
            payload.data
        );
    }
);

const payoutSlice = createSlice({
    name: "payoutSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(getPayout.pending, (state, action) => {
            state.isSkeleton = true;
        })

      builder.addCase(getPayout.fulfilled, (state, action) => {
          
            state.payout = action?.payload?.settlement;
            state.isSkeleton = false;
        })

        builder.addCase(getPayout.rejected, (state, action) => {
            state.isSkeleton = false;
        })

        
        builder.addCase(getAllPaymentHistory.pending, (state, action) => {
            state.isSkeleton = true;
        })

      builder.addCase(getAllPaymentHistory.fulfilled, (state, action) => {
          
            state.payout = action?.payload?.history;
            state.total = action?.payload?.total;
            state.isSkeleton = false;
        })

        builder.addCase(getAllPaymentHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        })

        builder.addCase(particularPaymentHistory.pending, (state, action) => {
            state.isSkeleton = true;
        })

      builder.addCase(particularPaymentHistory.fulfilled, (state, action) => {
          
            state.payout = action?.payload?.data;
            state.isSkeleton = false;
        })

        builder.addCase(particularPaymentHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        })

        builder.addCase(yearlyPaymentHistory.pending, (state, action) => {
            state.isSkeleton = true;
        })

      builder.addCase(yearlyPaymentHistory.fulfilled, (state, action) => {
          
            state.payout = action?.payload?.data;
            state.isSkeleton = false;
        })

        builder.addCase(yearlyPaymentHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        })

        builder.addCase(getExpertEarningBySalon.pending, (state) => {
            state.isSkeleton = true;
        });
        builder.addCase(getExpertEarningBySalon.fulfilled, (state, action) => {
            state.payout = action?.payload?.settlement || [];
            state.isSkeleton = false;
        });
        builder.addCase(getExpertEarningBySalon.rejected, (state) => {
            state.isSkeleton = false;
        });

        builder.addCase(paymentExpertBySalon.fulfilled, (state, action) => {
            if (action?.payload?.status && action?.payload?.settlement) {
                const idx = state.payout.findIndex((s) => s._id === action.payload.settlement._id);
                if (idx !== -1) state.payout[idx] = { ...state.payout[idx], ...action.payload.settlement };
            }
        });

        builder.addCase(bonusPenaltyExpertBySalon.fulfilled, (state, action) => {
            if (action?.payload?.status && action?.payload?.settlement) {
                const idx = state.payout.findIndex((s) => s._id === action.payload.settlement._id);
                if (idx !== -1) state.payout[idx] = { ...state.payout[idx], ...action.payload.settlement };
            }
        });
    }
})

  
export default payoutSlice.reducer;