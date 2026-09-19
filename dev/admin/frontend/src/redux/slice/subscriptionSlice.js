import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
  plans: [],
  featuresCatalog: [],
  salonSubscription: null,
  isLoading: false,
};

export const getSubscriptionPlans = createAsyncThunk(
  "admin/subscription/plans",
  async () => apiInstance.get("admin/subscription/plans")
);

export const createSubscriptionPlan = createAsyncThunk(
  "admin/subscription/create",
  async (payload) => apiInstance.post("admin/subscription/plans", payload)
);

export const updateSubscriptionPlan = createAsyncThunk(
  "admin/subscription/update",
  async ({ id, ...payload }) =>
    apiInstance.patch(`admin/subscription/plans?id=${id}`, payload)
);

export const toggleSubscriptionPlan = createAsyncThunk(
  "admin/subscription/toggle",
  async (id) => apiInstance.patch(`admin/subscription/plans/toggle?id=${id}`)
);

export const deleteSubscriptionPlan = createAsyncThunk(
  "admin/subscription/delete",
  async (id) => apiInstance.delete(`admin/subscription/plans?id=${id}`)
);

export const getSalonSubscription = createAsyncThunk(
  "admin/subscription/salonGet",
  async (salonId) =>
    apiInstance.get(`admin/subscription/salon?salonId=${salonId}`)
);

export const assignSalonSubscription = createAsyncThunk(
  "admin/subscription/salonAssign",
  async ({ salonId, ...payload }) =>
    apiInstance.patch(`admin/subscription/salon?salonId=${salonId}`, payload)
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.status) {
          state.plans = action.payload.data || [];
          state.featuresCatalog = action.payload.featuresCatalog || [];
        }
      })
      .addCase(getSubscriptionPlans.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(createSubscriptionPlan.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success(action.payload.message || "Plan créé");
          if (action.payload.data) state.plans.unshift(action.payload.data);
        }
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success(action.payload.message || "Plan mis à jour");
          const updated = action.payload.data;
          state.plans = state.plans.map((p) =>
            p._id === updated._id ? updated : p
          );
        }
      })
      .addCase(toggleSubscriptionPlan.fulfilled, (state, action) => {
        if (action.payload?.status) {
          const updated = action.payload.data;
          state.plans = state.plans.map((p) =>
            p._id === updated._id ? updated : p
          );
        }
      })
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success(action.payload.message || "Supprimé");
        }
      })
      .addCase(getSalonSubscription.fulfilled, (state, action) => {
        if (action.payload?.status) {
          state.salonSubscription = action.payload.data;
        }
      })
      .addCase(assignSalonSubscription.fulfilled, (state, action) => {
        if (action.payload?.status) {
          Success(action.payload.message || "Abonnement mis à jour");
          state.salonSubscription = action.payload.data;
        }
      });
  },
});

export default subscriptionSlice.reducer;
