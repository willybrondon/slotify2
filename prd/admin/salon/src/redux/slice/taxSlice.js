import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success, DangerRight } from "../../component/api/toastServices";

const initialState = {
    tax: [],
    isLoading: false,
    isSkeleton: false,
    total: null
}

export const getTax = createAsyncThunk("salon/tax/getAll", async ()=>{
    return apiInstanceFetch.get("salon/tax/getAll")
})

export const taxAdd = createAsyncThunk("salon/tax", async (payload)=>{
    
    return apiInstance.post("salon/tax",payload)
})

export const taxUpdate = createAsyncThunk("salon/tax/update", async (payload)=>{
    
    return apiInstance.patch(`salon/tax/update/${payload._id}`,payload.addTax)
})

export const taxStatus = createAsyncThunk("salon/tax/status", async (id)=>{
    return apiInstance.put(`salon/tax/status?taxId=${id}`)
})

export const taxDelete = createAsyncThunk("salon/tax/delete", async (id)=>{
  
    return apiInstance.delete(`salon/tax/delete/${id}`)
})


const taxSlice = createSlice({
    name: "taxSlice",
    initialState,
    reducers: {},
    extraReducers:(builder)=>{
        builder.addCase(getTax.pending,(state,action)=>{
            state.isSkeleton = true;
        })

        builder.addCase(getTax.fulfilled,(state,action)=>{
            state.tax = action.payload.tax
            state.isSkeleton = false;
        })

        builder.addCase(getTax.rejected,(state,action)=>{
            state.isSkeleton = false;
        })

        
        builder.addCase(taxAdd.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(taxAdd.fulfilled, (state, action) => {
            
            state.tax.unshift(action.payload.tax);
            state.isLoading = false;
            Success("Tax Added Successfully");
        });

        builder.addCase(taxAdd.rejected, (state, action) => {
            
            state.isLoading = false;
        });


        builder.addCase(taxUpdate.pending, (state, action) => {
            state.isLoading = true;
          });
      
          builder.addCase(taxUpdate.fulfilled, (state, action) => {
            if (action.payload.status) {
              if (action.payload.status) {
                const taxInx = state.tax.findIndex((tax) => tax._id === action.payload.tax._id);
                if (taxInx !== -1) {
                  state.tax[taxInx] = { ...state.tax[taxInx], ...action.payload.tax };
                }
              }
              Success("Tax Updated Successfully");
            }
            state.isLoading = false;

          });
      
          builder.addCase(taxUpdate.rejected, (state, action) => {
            
            state.isLoading = false;
          });

          // Category Status

          builder.addCase(taxStatus.pending, (state, action) => {
            state.isLoading = true;
          })
      
          builder.addCase(taxStatus.fulfilled, (state, action) => {
            if (action.payload.status) {
            }
            const updatedTax = action.payload.tax; // Assuming action.payload contains the updated category
            const taxIndex = state.tax.findIndex(tax => tax?._id === updatedTax?._id);
            if (taxIndex !== -1) {
                 
              state.tax[taxIndex].status = updatedTax.status;
            }
            state.isLoading = false;
            Success("Tax Status Updated Successfully");

          })
          builder.addCase(taxStatus.rejected, (state, action) => {
               
            state.isLoading = false;
          })

          builder.addCase(taxDelete.pending, (state, action) => {
            state.isLoading = true;
          })
          builder.addCase(taxDelete.fulfilled, (state, action) => {
              state.tax = state.tax.filter((tax) => tax._id !== action.meta.arg);
              state.isLoading = false;
              Success("Tax  Successfully");
          })
          builder.addCase(taxDelete.rejected, (state, action) => {
            
            state.isLoading = false;
          })
    }

})
export default taxSlice.reducer;