import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight,Success } from "../../component/api/toastServices";

const initialState = {
    complain: [],
    isLoading: false,
    isSkeleton: false,
    total: null
}


export const getComplains = createAsyncThunk(`salon/complain/getAll`, async (payload) => {
    return apiInstanceFetch.get(`salon/complain/getAll?type=${payload?.type}&start=${payload?.start}&limit=${payload?.limit}&person=${payload?.person}`);
})





const categorySlice = createSlice({
    name: "categorySlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(getComplains.pending, (state, action) => {
            state.isSkeleton = true;
        })

        builder.addCase(getComplains.fulfilled, (state, action) => {
          state.total = action.payload.total
            state.complain = action.payload.data;
            state.isSkeleton = false;
        })

        builder.addCase(getComplains.rejected, (state, action) => {
            state.isSkeleton = false;
        })
      
        
      

         
      
    }
})
export default categorySlice.reducer