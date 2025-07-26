/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import jwt_decode from "jwt-decode";
import { SetDevKey, setToken } from "../../util/setAuth";
import { secretKey } from "../../util/config";
import { DangerRight, Success } from "../../component/api/toastServices";
import axios from "axios";

const initialState = {
  admin: {},
  isAuth: false,
  isLoading: false,
};
export const signUp = createAsyncThunk("admin/signUp", async (payload) => {
  return apiInstance.post("admin/signUp", payload);
});

export const updateCode = createAsyncThunk(
  "admin/updateCode",
  async (payload) => {
    return apiInstance.patch("admin/updateCode", payload);
  }
);

export const login = createAsyncThunk("admin/login", async (payload) => {
  return apiInstance.post("admin/login", payload);
});

export const getAdmin = createAsyncThunk("admin/profile", async () => {
  return axios.get("admin/profile", {
    headers: {
      Authorization: `${localStorage.getItem("adminToken")}`,
    }
  });
});



export const updateAdmin = createAsyncThunk("admin/update", async (payload) => {
  return apiInstance.patch("admin/update", payload);
});

export const updateAdminPassword = createAsyncThunk(
  "admin/updatePassword",
  async (payload) => {
    return apiInstance.put("admin/updatePassword", payload);
  }
);

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setOldAdmin(state, action) {
      let token = action.payload;
      state.admin = token;
      state.isAuth = true;
      SetDevKey(secretKey);
      setToken(token);
    },
    logout(state, action) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin_");
      localStorage.removeItem("key");
      localStorage.removeItem("isAuth");
      state.admin = {};
      state.isAuth = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      if (action.payload && action.payload.status !== false) {
        let token_ = jwt_decode(action.payload.token);
        state.admin = token_;
        state.isAuth = true;
        SetDevKey(secretKey);
        setToken(action.payload.token);
        localStorage.setItem("adminToken", action.payload.token);
        localStorage.setItem("key", secretKey ? secretKey : undefined);
        Success("Login successfully");
      } else {
        DangerRight(action?.payload?.message);
      }
      state.isLoading = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      DangerRight(action?.payload?.message);
    });

    builder.addCase(signUp.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(signUp.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        Success("Admin Create Successfully");
      }
      state.isLoading = false;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateCode.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(updateCode.fulfilled, (state, action) => {
      state.isLoading = false;
      Success("Code Update Successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 10);
    });
    builder.addCase(updateCode.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(getAdmin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.admin = {
        ...state.admin,
        _id: action.payload?.data?.admin?._id,
        name: action.payload?.data?.admin?.name,
        email: action.payload?.data?.admin?.email,
        image: action.payload?.data?.admin?.image,
      };
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
        name: action.payload?.admin?.name,
        email: action.payload?.admin?.email,
        image: action.payload?.admin?.image,
      };
      state.isLoading = false;
      Success("Admin Updated Successfully");
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
      window.localStorage.clear();
      window.sessionStorage.clear();
      setToken();
      SetDevKey();
      state.admin = {};
      state.isAuth = false;

      window.location.href = "/login";
      Success("Admin Updated Successfully");
    });

    builder.addCase(updateAdminPassword.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});
export default authSlice.reducer;
export const { setOldAdmin, logout } = authSlice.actions;
