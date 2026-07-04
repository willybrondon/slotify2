import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";

const initialState = {
  attributes: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

export const getAllAttributes = createAsyncThunk(
  "salon/attributes/getAll",
  async () => {
    return apiInstanceFetch.get("salon/attributes");
  }
);

export const attributeAdd = createAsyncThunk(
  "salon/attributes/create",
  async (payload) => {
    return apiInstance.post("salon/attributes/create", payload);
  }
);

export const attributeUpdate = createAsyncThunk(
  "salon/attributes/update",
  async (data) => {
    return apiInstance.patch(
      `salon/attributes/update?attributesId=${data?.id}`,
      { name: data.name, value: data.value }
    );
  }
);

const attributeSlice = createSlice({
  name: "attributeSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllAttributes.pending, (state) => {
      state.isSkeleton = true;
    });

    builder.addCase(getAllAttributes.fulfilled, (state, action) => {
      state.attributes = action.payload?.attributes || [];
      state.total = state.attributes.length;
      state.isSkeleton = false;
    });

    builder.addCase(getAllAttributes.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(attributeAdd.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(attributeAdd.fulfilled, (state, action) => {
      if (action.payload?.status && action.payload?.attributes) {
        state.attributes.unshift(action.payload.attributes);
        state.total = (state.total || 0) + 1;
        Success(ui.toast.attributeAdded);
      }
      state.isLoading = false;
    });

    builder.addCase(attributeAdd.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(attributeUpdate.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(attributeUpdate.fulfilled, (state, action) => {
      if (action.payload?.status && action.payload?.attributes) {
        const updated = action.payload.attributes;
        const idx = state.attributes.findIndex((a) => a._id === updated._id);
        if (idx !== -1) {
          state.attributes[idx] = updated;
        }
        Success(ui.toast.attributeUpdated);
      }
      state.isLoading = false;
    });

    builder.addCase(attributeUpdate.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default attributeSlice.reducer;
