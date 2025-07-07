import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight,Success } from "../../component/api/toastServices";

const initialState = {
    category: [],
    isLoading: false,
    isSkeleton: false,
    total: null
}

export const getAllCategory = createAsyncThunk("admin/category/getAll", async () => {
    return apiInstanceFetch.get("admin/category/getAll");
})

export const categoryAdd = createAsyncThunk("admin/category/create", async (payload) => {
    return apiInstance.post("admin/category/create",payload);
})

export const categoryUpdate = createAsyncThunk("admin/category/update", async (payload) => {
     
    return apiInstance.patch(`admin/category/update?categoryId=${payload?.categoryId}`, payload?.formData);
  })

  export const categoryDelete = createAsyncThunk("admin/category/delete", async (id) => {
     
    return apiInstance.patch(`admin/category/delete?categoryId=${id}`)
  })
  
  export const categoryStatus = createAsyncThunk("admin/category/status", async (id) => {
    
    return apiInstance.put(`admin/category/status?categoryId=${id}`)
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
            state.category = action.payload.data;
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
            state?.category?.unshift(action?.payload?.data);
            state.total += 1;
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
              state.total -= 1;
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