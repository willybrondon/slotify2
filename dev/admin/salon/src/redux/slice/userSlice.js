import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";

const initialState = {
    user: [],
    isLoading: false,
    isSkeleton: false,
    total: null,
    history:[]
}

export const allUsers = createAsyncThunk("user/getAllUsers",async (payload)=>{
    
  return  apiInstanceFetch.get(`user/getAllUsers?start=${payload?.start}&limit=${payload?.limit}&search=${payload?.search}`)
})

/** Clientes du salon (bookings de CE salon — guest inclus) */
export const allSalonClients = createAsyncThunk("salon/clients", async (payload) => {
  const search = payload?.search == null ? "ALL" : payload.search;
  return apiInstanceFetch.get(
    `salon/clients?start=${payload?.start || 0}&limit=${payload?.limit || 20}&search=${encodeURIComponent(search)}`
  );
});

export const getUser = createAsyncThunk("user/getProfile", async (payload) => {
    return apiInstanceFetch.get(`user/getProfile?userId=${payload}`)
})
  
export const userHistory = createAsyncThunk("salon/userBookingForAdmin", async (payload) => {
    return apiInstanceFetch.get(`salon/userBookingForAdmin?userId=${payload?.userId}&type=${payload?.type}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`)
  })


export const blockUser = createAsyncThunk("user/userBlock", async (id) => {
    return apiInstance.put(`user/userBlock?userId=${id}`)
})

const userSlice = createSlice({
    name:"userSlice",
    initialState,
    reducers:{},
    extraReducers: (builder)=>{

        builder.addCase(allUsers.pending,(state,action)=>{
            state.isSkeleton = true;
        })

        builder.addCase(allUsers.fulfilled, (state, action) => {
            
            state.user = action.payload.users;
            state.total = action?.payload?.total
            state.isSkeleton = false;
        })

        builder.addCase(allUsers.rejected,(state,action)=>{
            state.isSkeleton = false;
        })

        builder.addCase(allSalonClients.pending, (state) => {
            state.isSkeleton = true;
        })
        builder.addCase(allSalonClients.fulfilled, (state, action) => {
            state.user = action.payload?.users || [];
            state.total = action.payload?.total || 0;
            state.isSkeleton = false;
        })
        builder.addCase(allSalonClients.rejected, (state) => {
            state.isSkeleton = false;
        })

        builder.addCase(userHistory.pending,(state,action)=>{
            state.isSkeleton = true;
        })

        builder.addCase(userHistory.fulfilled, (state,action) => {
            state.history = action.payload.data;
            state.isSkeleton = false;
        })

        builder.addCase(userHistory.rejected,(state,action)=>{
            state.isSkeleton = false;
        })


        builder.addCase(getUser.pending,(state,action)=>{
            state.isLoading = true;
        })

        builder.addCase(getUser.fulfilled, (state,action) => {
            state.user = action?.payload?.user;
            state.isLoading = false;
        })

        builder.addCase(getUser.rejected,(state,action)=>{
            state.isLoading = false;
        })

             
        builder.addCase(blockUser.pending, (state, action) => {
            
            state.isLoading = true;
        })

        builder.addCase(blockUser.fulfilled, (state,action) => {
            if (action.payload.status) {
                const updatedUser = action?.payload?.user;  
                const userIndex = state?.user?.findIndex(user => user?._id === updatedUser?._id);
                if (userIndex !== -1) {
                     
                  state.user[userIndex].isBlock = updatedUser?.isBlock;
                }
                Success(ui.toast.updated);
            }
            state.isLoading = false;

        })

        builder.addCase(blockUser.rejected,(state,action)=>{
            state.isLoading = false;
        })
    }

})
export default userSlice.reducer;
