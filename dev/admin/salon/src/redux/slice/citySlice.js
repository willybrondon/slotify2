import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DangerRight } from "../../component/api/toastServices";
import axios from "axios";

const initialState = {
    city: [],
    isLoading: false,
    isSkeleton: false,
    total: null
}

export const getAllCity = createAsyncThunk("https://countriesnow.space/api/v0.1/countries/population/cities", async () => {
    try {
        return axios.get(`https://countriesnow.space/api/v0.1/countries/population/cities`);
    } catch (error) {
        console.error('Error fetching data:', error);
        DangerRight(error?.message);
    }
})

const citySlice = createSlice({
    name: "city",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllCity.pending, (state) => {
            state.isLoading = true;
            state.isSkeleton = true;
        });
        builder.addCase(getAllCity.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSkeleton = false;
            state.city = action.payload.data;
            state.total = action.payload.data.length;
        });
        builder.addCase(getAllCity.rejected, (state) => {
            state.isLoading = false;
            state.isSkeleton = false;
        });
    },
});

export default citySlice.reducer;
