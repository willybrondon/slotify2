import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
  service: [],
  subCat: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getAllServices = createAsyncThunk(
  "admin/service/getAll",
  async (payload) => {
    return apiInstanceFetch.get(
      `admin/service/getAll?start=${payload.start}&limit=${payload.limit}&search=${payload?.search}`
    );
  }
);

export const addService = createAsyncThunk(
  "admin/service/create",
  async (payload) => {
    return apiInstance.post("admin/service/create", payload);
  }
);

export const updateService = createAsyncThunk(
  "admin/service/update",
  async (payload) => {
    return apiInstance.patch(
      `admin/service/update?serviceId=${payload.id}`,
      payload.formData
    );
  }
);

export const getCatSubCat = createAsyncThunk(
  "admin/subCategory/dropSubCategory",
  async (id) => {
    return apiInstanceFetch.get(`admin/subCategory/dropSubCategory/${id}`);
  }
);

export const deleteService = createAsyncThunk(
  "admin/service/delete",
  async (id) => {
    return apiInstance.patch(`admin/service/delete?serviceId=${id}`);
  }
);

export const serviceStatus = createAsyncThunk(
  "admin/service/handleStatus",
  async (id) => {
    return apiInstance.put(`admin/service/handleStatus?serviceId=${id}`);
  }
);

const serviceSlice = createSlice({
  name: "serviceSlice",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(getCatSubCat.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getCatSubCat.fulfilled, (state, action) => {
      state.subCat = action.payload.subcategories;
      state.isLoading = false;
    });

    builder.addCase(getCatSubCat.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getAllServices.pending, (state, action) => {
      state.isSkeleton = action.meta.arg.command;
      state.isSkeleton = true;
    });

    builder.addCase(getAllServices.fulfilled, (state, action) => {
      state.total = action.payload.total;
      state.service = action.payload.services;
      state.isSkeleton = false;
    });

    builder.addCase(getAllServices.rejected, (state, action) => {
      state.isSkeleton = false;
    });

    builder.addCase(addService.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(addService.fulfilled, (state, action) => {
      if (action.payload.status) {
        const dataObject = {
          ...action.payload.data,
          // subcategoryname: action.payload.service?.subcategoryId?.name,
          categoryname: action.payload.data?.categoryId?.name,
        };
        state.service.unshift(dataObject);

        state.total += 1;
        Success("Service Add Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(addService.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateService.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(updateService.fulfilled, (state, action) => {
      if (action.payload.status) {
        if (action.payload.status) {
          const serviceInx = state.service.findIndex(
            (service) => service._id === action.payload.service._id
          );
          if (serviceInx !== -1) {
            state.service[serviceInx] = {
              ...state.service[serviceInx],
              ...action.payload.service,
            };
          }
        }
        Success("Service Update Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(updateService.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(deleteService.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(deleteService.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.service = state.service.filter(
          (service) => service._id !== action.meta.arg
        );
        state.total -= 1;
        Success("Service Delete Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(deleteService.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(serviceStatus.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(serviceStatus.fulfilled, (state, action) => {
      if (action.payload.status) {
        const updatedService = action.payload.service;
        const serviceIndex = state.service.findIndex(
          (service) => service?._id === updatedService?._id
        );
        if (serviceIndex !== -1) {
          state.service[serviceIndex].status = updatedService.status;
        }
        state.isLoading = false;

        Success("Updated Successfully");
      }
    });
    builder.addCase(serviceStatus.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default serviceSlice.reducer;
