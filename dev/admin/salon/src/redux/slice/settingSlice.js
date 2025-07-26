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
    return apiInstanceFetch.get("admin/setting")
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
            state.currency = action.payload.setting
        })

        builder.addCase(getCurrency.rejected, (state, action) => {
            state.isLoading = false;
        })

    }
})
export default settingSlice.reducer;