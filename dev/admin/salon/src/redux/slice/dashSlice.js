import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";
import axios from "axios";

const initialState = {
    booking: [],
    isLoading: false,
    isSkeleton: false,
    dashData:{},
    chartData:[]
}

const token = sessionStorage.getItem("token")

export const topExperts = createAsyncThunk("salon/dashboard/topExperts", async (payload) =>{
    return  axios.get(`salon/dashboard/topExperts?startDate=${payload.startDate}&endDate=${payload.endDate}` , {
      headers : {
          Authorization : token
      }
    })
  })
  
  export const getDashData = createAsyncThunk("salon/dashboard/allStats", async (payload) =>{
      return  axios.get(`salon/dashboard/allStats?startDate=${payload.startDate}&endDate=${payload.endDate}`, {
          headers : {
              Authorization : token
          }
        })
    })
  
    export const getChart = createAsyncThunk("salon/dashboard/chart", async (payload) =>{
      return  axios.get(`salon/dashboard/chart?startDate=${payload?.startDate}&endDate=${payload?.endDate}`, {
          headers : {
              Authorization : token
          }
       })
    }) 


const dashSlice = createSlice({
    name:"dashSlice",
    initialState,
    reducers:{},
    extraReducers:(builder) =>{

        builder.addCase(topExperts.pending,(state,action) =>{
            state.isSkeleton = true;
        })

        builder.addCase(topExperts.fulfilled,(state,action) =>{
            
            state.booking = action?.payload?.topExperts || action?.payload?.data?.topExperts
            state.isSkeleton = false;
        })

        builder.addCase(topExperts.rejected,(state,action) =>{
            
            state.isSkeleton = false;
        })

        builder.addCase(getDashData.pending,(state,action) =>{
            state.isSkeleton = true;
        })

        builder.addCase(getDashData.fulfilled,(state,action) =>{
            
            state.dashData = action?.payload?.data.data
            state.isSkeleton = false;
        })

        builder.addCase(getDashData.rejected,(state,action) =>{
            
            state.isSkeleton = false;
        })

        builder.addCase(getChart.fulfilled,(state,action) =>{
            
            state.chartData = action?.payload?.data
            state.isSkeleton = false;
        })

        builder.addCase(getChart.rejected,(state,action) =>{
            
            state.isSkeleton = false;
            DangerRight(action?.message)
        })
    }
})
export default dashSlice.reducer