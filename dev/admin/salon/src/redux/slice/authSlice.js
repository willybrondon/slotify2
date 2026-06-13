/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import jwt_decode from "jwt-decode";
import { SetDevKey, setToken } from "../../util/setAuth";
import { secretKey } from "../../util/config";
import { DangerRight, Success } from "../../component/api/toastServices";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";
import axios from "axios";

const initialState = {
  admin: {},
  isAuth: false,
  isLoading: false,
};

export const login = createAsyncThunk("salon/login", async (payload) => {
  return apiInstance.post("salon/login", payload);
});

export const getAdmin = createAsyncThunk("salon/profile", async () => {
  return apiInstanceFetch.get("salon/profile");
});

export const updateAdmin = createAsyncThunk("salon/update", async (payload) => {
  return apiInstance.patch(
    `salon/update?salonId=${payload?.salonId}`,
    payload?.formData
  );
});

export const updateAdminPassword = createAsyncThunk(
  "salon/updatePassword",
  async (payload) => {
    return apiInstance.patch("salon/updatePassword", payload);
  }
);

export const activesalon = createAsyncThunk(
  "admin/salon/isActive",
  async (id) => {
    return apiInstance.put(`admin/salon/isActive?salonId=${id}`);
  }
);

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setOldAdmin(state, action) {
      const raw = action.payload;
      if (!raw) return;
      try {
        state.admin = jwt_decode(raw);
      } catch (e) {
        state.admin = {};
      }
      state.isAuth = true;
      const storedKey = sessionStorage.getItem("key");
      SetDevKey(storedKey && storedKey !== "undefined" ? storedKey : secretKey);
      setToken(raw);
    },
    logout(state, action) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("admin_");
      sessionStorage.removeItem("key");
      sessionStorage.removeItem("isAuth");
      state.admin = {};
      state.isAuth = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      // console.log("Actionnn",action)
      if (action.payload && action.payload.status !== false) {
        let token_ = jwt_decode(action.payload.token);
        state.admin = token_;
        state.isAuth = true;
        SetDevKey(secretKey);
        setToken(action.payload.token);
        // console.log("action.payload.token", action.payload.token);
        
        // Ensure session storage is set synchronously
        try {
          sessionStorage.setItem("token", action.payload.token);
          if (secretKey) {
            sessionStorage.setItem("key", secretKey);
          }
          sessionStorage.setItem("isAuth", "true");
          
          // Force a small delay to ensure session storage is properly set
          setTimeout(() => {
            Success(ui.toast.loginOk);
          }, 50);
        } catch (error) {
          console.error("Error setting session storage:", error);
          DangerRight(ui.toast.loginFail);
        }
      } else {
        DangerRight(action?.payload?.message);
      }
      state.isLoading = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getAdmin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.admin = action.payload.salon;
    });

    builder.addCase(getAdmin.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateAdmin.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(updateAdmin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.admin = {
        ...state.admin,
        ...action.payload.data,
      };
      state.isLoading = false;
      Success(ui.toast.adminUpdated);
    });

    builder.addCase(updateAdmin.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateAdminPassword.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(updateAdminPassword.fulfilled, (state, action) => {
      state.isLoading = false;
      state.admin = action?.payload?.admin;
      // sessionStorage.removeItem("token");
      // sessionStorage.removeItem("key");
      // sessionStorage.removeItem("isAuth");
      // setToken();
      // SetDevKey();
      // state.admin = {};
      // state.isAuth = false;

      // window.location.href = "/salonPanel/login";
      Success(ui.toast.passwordUpdated);
    });

    builder.addCase(updateAdminPassword.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default authSlice.reducer;
export const { setOldAdmin, logout } = authSlice.actions;
