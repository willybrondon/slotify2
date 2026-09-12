import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstanceFetch } from "../../component/api/axiosApi";

export const getAllDemands = createAsyncThunk(
  "salon/demand/getAll",
  async (payload) => {
    const status = payload?.status ? `&status=${payload.status}` : "";
    return apiInstanceFetch.get(
      `salon/demand/getAll?limit=${payload?.limit || 100}${status}`
    );
  }
);

export const adjustDemand = createAsyncThunk(
  "salon/demand/adjust",
  async (payload) => {
    return apiInstanceFetch.put(`salon/demand/adjust/${payload.id}`, payload.body);
  }
);

export const fetchAfroConfig = createAsyncThunk(
  "salon/demand/afro-config/get",
  async () => {
    return apiInstanceFetch.get(`salon/demand/afro-config`);
  }
);

export const updateAfroConfig = createAsyncThunk(
  "salon/demand/afro-config",
  async (payload) => {
    return apiInstanceFetch.put(`salon/demand/afro-config`, payload);
  }
);

const demandSlice = createSlice({
  name: "demand",
  initialState: {
    demands: [],
    isLoading: false,
    afroEnabled: false,
    afroServices: [],
    publicDemandPath: "",
    configLoading: false,
    onboarding: null,
    stripeConnect: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllDemands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllDemands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.demands = action.payload?.demands || [];
      })
      .addCase(getAllDemands.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(adjustDemand.fulfilled, (state, action) => {
        const updated = action.payload?.demand;
        if (!updated?._id) return;
        state.demands = state.demands.map((d) =>
          String(d._id) === String(updated._id) ? { ...d, ...updated } : d
        );
      })
      .addCase(fetchAfroConfig.pending, (state) => {
        state.configLoading = true;
      })
      .addCase(fetchAfroConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.afroEnabled = Boolean(action.payload?.afroProjectFlowEnabled);
        state.afroServices = action.payload?.services || [];
        state.publicDemandPath = action.payload?.publicDemandPath || "";
        state.onboarding = action.payload?.onboarding || null;
        state.stripeConnect = action.payload?.stripeConnect || null;
      })
      .addCase(fetchAfroConfig.rejected, (state) => {
        state.configLoading = false;
      })
      .addCase(updateAfroConfig.fulfilled, (state, action) => {
        if (typeof action.payload?.afroProjectFlowEnabled === "boolean") {
          state.afroEnabled = action.payload.afroProjectFlowEnabled;
        }
      });
  },
});

export default demandSlice.reducer;
