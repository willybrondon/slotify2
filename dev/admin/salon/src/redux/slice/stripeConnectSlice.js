import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

export const fetchStripeConnectStatus = createAsyncThunk(
  "salon/stripeConnect/status",
  async () => apiInstanceFetch.get("salon/stripeConnect/status")
);

export const updateSalonPaymentMethods = createAsyncThunk(
  "salon/stripeConnect/paymentMethods",
  async (payload) =>
    apiInstanceFetch.patch("salon/stripeConnect/paymentMethods", payload)
);

export const startStripeOnboarding = createAsyncThunk(
  "salon/stripeConnect/onboard",
  async () => apiInstanceFetch.post("salon/stripeConnect/onboard")
);

export const refreshStripeConnect = createAsyncThunk(
  "salon/stripeConnect/refresh",
  async () => apiInstanceFetch.get("salon/stripeConnect/refresh")
);

const stripeConnectSlice = createSlice({
  name: "stripeConnect",
  initialState: {
    status: null,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchStripeConnectStatus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchStripeConnectStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload?.status) {
        state.status = action.payload.data;
      }
    });
    builder.addCase(fetchStripeConnectStatus.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(updateSalonPaymentMethods.fulfilled, (state, action) => {
      if (action.payload?.status) {
        state.status = {
          ...state.status,
          paymentMethods: action.payload.data?.paymentMethods,
          options: action.payload.data?.options,
        };
        Success("Modes de paiement mis à jour.");
      }
    });
    builder.addCase(startStripeOnboarding.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(startStripeOnboarding.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(startStripeOnboarding.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(refreshStripeConnect.fulfilled, (state, action) => {
      if (action.payload?.status) {
        state.status = {
          ...state.status,
          stripeConnect: action.payload.data?.stripeConnect,
          options: action.payload.data?.options,
        };
      }
    });
  },
});

export default stripeConnectSlice.reducer;
