import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
    withDraw: [],
    expertWithDraw: [],
    walletHistory:[],
    walletBalance: 0,
    effectiveMinWalletBalance: 0,
    isLoading: false,
    isSkeleton: false,
    total: null,
    history: []
}

export const getExpertWithDraw = createAsyncThunk("salon/getExpertWithDraw", async (payload) => {
    return apiInstanceFetch.get(
        `salon/expertWithdrawRequest/withdrawRequestOfExpertBySalon?start=${payload.start}&limit=${payload.limit}&status=${payload.status}&startDate=${payload.startDate}&endDate=${payload.endDate}`
    );
});

export const acceptExpertWithDraw = createAsyncThunk(
    "salon/acceptExpertWithDraw/status",
    async (id) => {
        return apiInstance.patch(
            `salon/expertWithdrawRequest/withdrawRequestApproved?requestId=${id}`
        );
    }
);

export const rejectExpertWithDraw = createAsyncThunk(
    "salon/rejectExpertWithDraw/status",
    async (payload) => {
        return apiInstance.patch(
            `salon/expertWithdrawRequest/withdrawRequestDecline?requestId=${payload?.id}&reason=${encodeURIComponent(payload?.reason || "")}`
        );
    }
);

export const getWithDrawMethod = createAsyncThunk("user/getWithDrawMethod", async (payload) => {

    return apiInstanceFetch.get(`salon/withdrawMethod/getWithdrawMethodsBySalon`)
})
export const getWalletHistory = createAsyncThunk("user/getWalletHistory", async (payload) => {
    const params = new URLSearchParams({
        type: payload?.type || "All",
        startDate: payload?.startDate || "All",
        endDate: payload?.endDate || "All",
        start: payload?.start || 0,
        limit: payload?.limit || 10,
    });
    return apiInstanceFetch.get(`salon/fetchSalonWalletHistory?${params.toString()}`)
})

export const addWithDrawMethod = createAsyncThunk(
    "salon/addWithDrawMethod/post",
    async (payload) => {

        return apiInstance.post(
            `salon/withdrawRequest/withdrawRequestBySalon`,
            payload
        );
    }
);

export const depositToWallet = createAsyncThunk(
    "salon/depositToWallet/post",
    async (payload) => {
        const params = new URLSearchParams({
            amount: payload.amount,
            paymentGateway: payload.paymentGateway,
        });
        return apiInstanceFetch.post(`salon/depositeToWallet?${params.toString()}`);
    }
);



const withDrawSlice = createSlice({
    name: "withDrawSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(getWithDrawMethod.pending, (state, action) => {
            state.isSkeleton = true;
        })

        builder.addCase(getWithDrawMethod.fulfilled, (state, action) => {

            state.withDraw = action.payload.data;
            state.total = action?.payload?.total
            state.isSkeleton = false;
        })

        builder.addCase(getWithDrawMethod.rejected, (state, action) => {
            state.isSkeleton = false;
        })
        builder.addCase(getWalletHistory.pending, (state, action) => {
            state.isSkeleton = true;
        })

        builder.addCase(getWalletHistory.fulfilled, (state, action) => {

            state.walletHistory = action.payload.data;
            state.total = action?.payload?.total;
            state.walletBalance = action?.payload?.walletBalance || 0;
            state.effectiveMinWalletBalance = action?.payload?.effectiveMinWalletBalance ?? 0;
            state.isSkeleton = false;
        })

        builder.addCase(getWalletHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        })
        
        builder.addCase(depositToWallet.pending, (state, action) => {
            state.isLoading = true;
        })

        builder.addCase(depositToWallet.fulfilled, (state, action) => {
            state.walletBalance = action?.payload?.walletBalance || state.walletBalance;
            state.isLoading = false;
        })

        builder.addCase(depositToWallet.rejected, (state, action) => {
            state.isLoading = false;
        })

        builder.addCase(getExpertWithDraw.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getExpertWithDraw.fulfilled, (state, action) => {
            state.isLoading = false;
            state.expertWithDraw = action.payload?.request || [];
            state.total = action.payload?.total;
        });
        builder.addCase(getExpertWithDraw.rejected, (state) => {
            state.isLoading = false;
        });
    }

})
export default withDrawSlice.reducer;