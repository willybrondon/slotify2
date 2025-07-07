import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const token = sessionStorage.getItem("token");

const initialState = {
  service: [],
  particularService: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getAllServices = createAsyncThunk(
  "salon/service/getNotAddedServices",
  async () => {
    return apiInstanceFetch.get(`salon/service/getNotAddedServices`);
  }
);

export const addService = createAsyncThunk("salon/service", async (payload) => {
  return apiInstance.post("salon/service", payload,{
    headers:{
      Authorization:token
    }
  });
});

export const updateService = createAsyncThunk(
  "salon/addServices",
  async (payload) => {
    return apiInstance.patch(`salon/addServices`, payload.data);
  }
);

export const getParticularSalonService = createAsyncThunk(
  "salon/service/salonServices",
  async () => {
    return apiInstanceFetch.get(`salon/service/salonServices`);
  }
);

export const deleteService = createAsyncThunk(
  "salon/removeService",
  async (id) => {
    return apiInstance.patch(`salon/removeService?serviceId=${id}`);
  }
);

const serviceSlice = createSlice({
  name: "serviceSlice",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(getParticularSalonService.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getParticularSalonService.fulfilled, (state, action) => {
      
      state.particularService = action?.payload?.data;
      console.log("mannn==", action?.payload);
      console.log("ashu===", state.particularService);
      
      
     
      state.isLoading = false;
    });
    

    builder.addCase(getParticularSalonService.rejected, (state, action) => {
      
      state.isLoading = false;
    });

    builder.addCase(getAllServices.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getAllServices.fulfilled, (state, action) => {
      
      state.service = action.payload.data;
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
        state.service = state.service.filter(
          (service) => service.id !== action.payload.serviceId
        );
        const dataObject = {
          ...action.payload.services,
        };
        state.particularService.unshift(dataObject);
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
        const serviceIdToRemove = action.payload.serviceId;
        const indexToRemove = state.service.findIndex(
          (service) => service.id === serviceIdToRemove
        );
        if (indexToRemove !== -1) {
          state.service.splice(indexToRemove, 1);
        }

        
        state.particularService = action.payload.services
        Success("Service Add Successfully");
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
        
        state.particularService = action.payload.salon;
        Success("Service Delete Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(deleteService.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default serviceSlice.reducer;
