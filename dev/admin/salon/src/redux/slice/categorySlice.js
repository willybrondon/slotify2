import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight,Success } from "../../component/api/toastServices";

const initialState = {
    category: [],
    isLoading: false,
    isSkeleton: false,
    total: null
}

export const getAllCategory = createAsyncThunk("salon/category/getAllCategory", async () => {
    return apiInstanceFetch.get("salon/category/getAllCategory");
})

export const categoryAdd = createAsyncThunk("salon/category", async (payload) => {
    return apiInstance.post("salon/category",payload);
})

export const categoryUpdate = createAsyncThunk("salon/category/update", async (payload) => {
     
    return apiInstance.patch(`salon/category/update/${payload?.categoryId}`, payload?.formData);
  })

  export const categoryDelete = createAsyncThunk("salon/category/delete", async (id) => {
     
    return apiInstance.patch(`salon/category/delete/${id}`)
  })
  
  export const categoryStatus = createAsyncThunk("salon/category/status", async (id) => {
    
    return apiInstance.put(`salon/category/status?categoryId=${id}`)
  })

  
const categorySlice = createSlice({
    name: "categorySlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(getAllCategory.pending, (state, action) => {
            state.isSkeleton = true;
        })

        builder.addCase(getAllCategory.fulfilled, (state, action) => {
          state.total = action.payload.total
            state.category = action.payload.categories;
            state.isSkeleton = false;
        })

        builder.addCase(getAllCategory.rejected, (state, action) => {
            state.isSkeleton = false;
        })

        builder.addCase(categoryAdd.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(categoryAdd.fulfilled, (state, action) => {
          if (action.payload.status) {
            state.category.unshift(action.payload.category);
        
            Success("Category Add Successfully")
          }
            state.isLoading = false;
        });

        builder.addCase(categoryAdd.rejected, (state, action) => {
            
            state.isLoading = false;
        });


        builder.addCase(categoryUpdate.pending, (state, action) => {
            state.isLoading = true;
          });
      
          builder.addCase(categoryUpdate.fulfilled, (state, action) => {
            
            if (action.payload.status) {
              const categoryInx = state.category.findIndex((category) => category._id === action.payload.category._id);
              if (categoryInx !== -1) {
                state.category[categoryInx] = { ...state.category[categoryInx], ...action.payload.category };
              }
            }
            state.isLoading = false;
            Success("Category Update Successfully")

          });
      
          builder.addCase(categoryUpdate.rejected, (state, action) => {
            
            state.isLoading = false;
          });

          // Category Status

          builder.addCase(categoryStatus.pending, (state, action) => {
            state.isLoading = true;
          })
      
          builder.addCase(categoryStatus.fulfilled, (state, action) => {
            if (action.payload.status) {
              const updatedCategory = action.payload.category;
              const categoryIndex = state.category.findIndex(category => category?._id === updatedCategory?._id);
              if (categoryIndex !== -1) {
                   
                state.category[categoryIndex].status = updatedCategory.status;
              }
              Success("Category Status Update Successfully")       
            }
            state.isLoading = false;

          })
          builder.addCase(categoryStatus.rejected, (state, action) => {
               
            state.isLoading = false;
          })

          builder.addCase(categoryDelete.pending, (state, action) => {
            state.isLoading = true;
          })
          builder.addCase(categoryDelete.fulfilled, (state, action) => {
            if (action.payload.status) {
              state.category = state.category.filter((category) => category._id !== action.meta.arg);
              Success("Category Delete Successfully")
            }
            state.isLoading = false;

          })
          builder.addCase(categoryDelete.rejected, (state, action) => {
            state.isLoading = false;
          })
      
    }
})
export default categorySlice.reducer