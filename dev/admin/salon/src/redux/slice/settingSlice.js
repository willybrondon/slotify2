import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi"
import { DangerRight,Success } from "../../component/api/toastServices";


const initialState = {
    setting: {},
    currency:"",
    isLoading: false,
    isSkeleton: false
}


export const getSetting = createAsyncThunk("salon/getSetting", async (payload) => {
    return apiInstanceFetch.get("salon/getCurrency")
})
export const getCurrency = createAsyncThunk("salon/getCurrency", async (payload) => {
    return apiInstanceFetch.get("salon/getCurrency")
})



const settingSlice = createSlice({
    name: "settingSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(getSetting.pending, (state, action) => {
            state.isLoading = true;
        })

        builder.addCase(getSetting.fulfilled, (state, action) => {
            state.isLoading = false;
            state.setting = action.payload.data
        })

        builder.addCase(getSetting.rejected, (state, action) => {
            state.isLoading = false;
        })

        builder.addCase(getCurrency.pending, (state, action) => {
            state.isLoading = true;
        })

        builder.addCase(getCurrency.fulfilled, (state, action) => {
            state.isLoading = false;
            // salon/getCurrency returns { status: true, data: setting }
            // admin/setting returns { status: true, setting }
            state.currency = action.payload.data || action.payload.setting
        })

        builder.addCase(getCurrency.rejected, (state, action) => {
            state.isLoading = false;
        })

    }
})
export default settingSlice.reducer;