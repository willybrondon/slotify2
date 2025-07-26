import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
  setting: {},
  isLoading: false,
  isSkeleton: false,
};

export const getSetting = createAsyncThunk("admin/setting", async (payload) => {
  return apiInstanceFetch.get("admin/setting");
});

export const updateSetting = createAsyncThunk(
  "admin/setting/update",
  async (payload) => {
    return apiInstance.patch(`admin/setting/update`, payload.data);
  }
);

export const maintenanceMode = createAsyncThunk(
  "admin/setting/appActive",
  async (id) => {
    return apiInstance.put(`admin/setting/handleSwitch?type=3`);
  }
);

export const handleSetting = createAsyncThunk(
  "admin/setting/handleSwitch",
  async (payload) => {
    return apiInstance.put(
      `admin/setting/handleSwitch?type=${payload?.type}`,
      payload.data
    );
  }
);
export const addProductRequest = createAsyncThunk(
  "admin/setting/addProductRequest",
  async (payload) => {
    return apiInstance.put(
      `admin/setting/handleSwitch?type=${payload?.type}`,
      payload.data
    );
  }
);

export const deleteReview = createAsyncThunk(
  "admin/review/delete",
  async (id) => {
    return apiInstance.delete(`admin/review/delete/${id}`);
  }
);

const settingSlice = createSlice({
  name: "settingSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSetting.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getSetting.fulfilled, (state, action) => {
      state.isLoading = false;
      state.setting = action.payload.setting;
    });

    builder.addCase(getSetting.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateSetting.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(updateSetting.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.setting = { ...state.setting, ...action.payload.setting };
        Success("Setting Updated Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(updateSetting.rejected, (state) => {});

    builder.addCase(maintenanceMode.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.setting = { ...state.setting, ...action.payload.setting };
        Success("Maintenance Mode Updated Successfully");
      }
      state.isLoading = false;
    });
    builder.addCase(handleSetting.fulfilled, (state, action) => {
      state.setting = action.payload.setting;
      Success("Updated Successfully");
    });
  },
});
export default settingSlice.reducer;
