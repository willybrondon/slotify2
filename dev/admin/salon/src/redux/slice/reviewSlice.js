import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
    review: [],
    isLoading: false,
    isSkeleton: false
}


export const getAllReview = createAsyncThunk("salon/review/getAll", async (payload) => {
    
    return apiInstanceFetch.get(`salon/review/getAll?start=${payload.start}&limit=${payload.limit}?search=${payload?.search}`)
})
export const deleteReview = createAsyncThunk("admin/review/delete", async (id) => {

    return apiInstance.delete(`admin/review/delete?reviewId=${id}`)
})

const reviewSlice = createSlice({
    name: "reviewSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(getAllReview.pending, (state, action) => {
            state.isSkeleton = true;
        })

        builder.addCase(getAllReview.fulfilled, (state, action) => {
            state.review = action.payload.data
            state.total = action.payload.total
            state.isSkeleton = false;

        })

        builder.addCase(getAllReview.rejected, (state, action) => {
            state.isSkeleton = false;
        })

        builder.addCase(deleteReview.pending, (state, action) => {
            state.isLoading = true;
        })

        builder.addCase(deleteReview.fulfilled, (state, action) => {
            if (action.payload.status) {
                
                state.review = state.review.filter((review) => review._id !== action.meta.arg);
                Success("Review Deleted Successfully")
            }
            state.isLoading = false;
        })
        builder.addCase(deleteReview.rejected, (state, action) => {

            state.isLoading = false;
        })
    }
})
export default reviewSlice.reducer;