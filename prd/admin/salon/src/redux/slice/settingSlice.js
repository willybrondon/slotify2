import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi"
import { DangerRight,Success } from "../../component/api/toastServices";


const initialState = {
    setting: {},
    isLoading: false,
    isSkeleton: false
}


export const getSetting = createAsyncThunk("salon/getCurrency", async (payload) => {
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

    }
})
export default settingSlice.reducer;