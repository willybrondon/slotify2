import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";


const initialState = {
    salon: [],
    isLoading: false,
    isSkeleton: false,
    dashData:{},
    chartData:[]
}

export const topSalons = createAsyncThunk("admin/dashboard/topSalons", async (payload) =>{
  return  apiInstanceFetch.get(`admin/dashboard/topSalons?startDate=${payload?.startDate}&endDate=${payload?.endDate}`)
})
export const getUpcomingBookings = createAsyncThunk("admin/booking/upcoming", async (payload) =>{
  return  apiInstanceFetch.get(`admin/booking/upcoming?startDate=${payload?.startDate}&endDate=${payload?.endDate}`)
})

export const getDashData = createAsyncThunk("admin/dashboard/allStats", async (payload) =>{
    return  apiInstanceFetch.get(`admin/dashboard/allStats?startDate=${payload?.startDate}&endDate=${payload?.endDate}`)
  })

  export const getChart = createAsyncThunk("admin/dashboard/chart", async (payload) =>{
    return  apiInstanceFetch.get(`admin/dashboard/chart?startDate=${payload?.startDate}&endDate=${payload?.endDate}`)
  })
const dashSlice = createSlice({
    name:"dashSlice",
    initialState,
    reducers:{},
    extraReducers:(builder) =>{

        builder.addCase(topSalons.pending,(state,action) =>{
            state.isLoading = true;
        })

        builder.addCase(topSalons.fulfilled,(state,action) =>{
            
            state.salon = action?.payload?.topSalons
            state.isLoading = false;
        })

        builder.addCase(topSalons.rejected,(state,action) =>{
            
            state.isLoading = false;
        })

        builder.addCase(getDashData.pending,(state,action) =>{
            state.isSkeleton = true;
        })

        builder.addCase(getDashData.fulfilled,(state,action) =>{
            
            state.dashData = action?.payload?.data
            state.isSkeleton = false;
        })

        builder.addCase(getDashData.rejected,(state,action) =>{
            
            state.isSkeleton = false;
        })

        builder.addCase(getChart.fulfilled,(state,action) =>{
            
            state.chartData = action?.payload?.appointments
            state.isSkeleton = false;
        })

        builder.addCase(getChart.rejected,(state,action) =>{
            
            state.isSkeleton = false;
            DangerRight(action?.message)
        })
    }
})
export default dashSlice.reducer