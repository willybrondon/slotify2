import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
    withDraw: [],
    walletHistory:[],
    isLoading: false,
    isSkeleton: false,
    total: null,
    history: []
}

export const getWithDrawMethod = createAsyncThunk("user/getWithDrawMethod", async (payload) => {

    return apiInstanceFetch.get(`salon/withdrawMethod/getWithdrawMethodsBySalon`)
})
export const getWalletHistory = createAsyncThunk("user/getWalletHistory", async (payload) => {

    return apiInstanceFetch.get(`salon/fetchSalonWalletHistory?type=${payload?.type}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`)
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
            state.total = action?.payload?.total
            state.isSkeleton = false;
        })

        builder.addCase(getWalletHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        })
    }

})
export default withDrawSlice.reducer;