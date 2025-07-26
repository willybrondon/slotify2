import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
    withDraw: [],
    expertWithDraw: [],
    salonWithDraw: [],
    isLoading: false,
    isSkeleton: false,
    total: null,
};

export const getWithDraw = createAsyncThunk("admin/getWithDraw", async (payload) => {
    return apiInstanceFetch.get(`admin/withdrawMethod/getMethods?start=${payload.start}&limit=${payload.limit}`);
});

export const addWithDraw = createAsyncThunk(
    "admin/addWithDraw/add",
    async (payload) => {
        return apiInstance.post("admin/withdrawMethod/create", payload);
    }
);
export const updateWithDraw = createAsyncThunk(
    "admin/updateWithDraw/update",
    async (payload) => {
        return apiInstance.patch(
            `admin/withdrawMethod/update?withdrawMethodId=${payload?.id}`,
            payload?.formData
        );
    }
);
export const statusWithDraw = createAsyncThunk(
    "admin/statusWithDraw/status",
    async (id) => {
        return apiInstance.patch(
            `admin/withdrawMethod/handleSwitch?withdrawMethodId=${id}`
        );
    }
);

export const withDrawDelete = createAsyncThunk(
    "admin/withDrawDelete/delete",
    async (id) => {
        return apiInstance.delete(`admin/withdrawMethod/delete?withdrawMethodId=${id}`);
    }
);

export const getExpertWithDraw = createAsyncThunk("admin/getExpertWithDraw", async (payload) => {
    return apiInstanceFetch.get(`admin/expertWithdrawRequest/withdrawRequestOfExpertByAdmin?start=${payload.start}&limit=${payload.limit}&status=${payload.status}&startDate=${payload.startDate}&endDate=${payload.endDate}`);
});
export const getSalonWithDraw = createAsyncThunk("admin/getSalonWithDraw", async (payload) => {
    return apiInstanceFetch.get(`admin/salonWithdrawRequest/retriveSalonWithdRequest?start=${payload.start}&limit=${payload.limit}&status=${payload.status}&startDate=${payload.startDate}&endDate=${payload.endDate}`);
});

export const acceptWithDraw = createAsyncThunk(
    "admin/acceptWithDraw/status",
    async (id) => {
        return apiInstance.patch(
            `admin/expertWithdrawRequest/withdrawRequestApproved?requestId=${id}`
        );
    }
);
export const acceptSalonWithDraw = createAsyncThunk(
    "admin/acceptSalonWithDraw/status",
    async (id) => {
        return apiInstance.patch(
            `admin/salonWithdrawRequest/withdrawRequestApproved?requestId=${id}`
        );
    }
);
export const rejectSalonWithDraw = createAsyncThunk(
    "admin/rejectSalonWithDraw/status",
    async (payload) => {
        return apiInstance.patch(
            `admin/salonWithdrawRequest/withdrawRequestRejected?requestId=${payload?.requestId}&reason=${payload?.reason}`
        );
    }
);
export const rejectedWithDraw = createAsyncThunk(
    "admin/rejectedWithDraw/status",
    async (payload) => {
        return apiInstance.patch(
            `admin/expertWithdrawRequest/withdrawRequestDecline?requestId=${payload?.id}&reason=${payload?.reason}`
        );
    }
);


const withDrawSlice = createSlice({
    name: "withDrawSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getWithDraw.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(getWithDraw.fulfilled, (state, action) => {
            state.isLoading = false;
            state.withDraw = action.payload.data;
            state.total = action.payload.total;
        });

        builder.addCase(getWithDraw.rejected, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(getExpertWithDraw.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(getExpertWithDraw.fulfilled, (state, action) => {
            state.isLoading = false;
            state.expertWithDraw = action.payload.request;
        });

        builder.addCase(getExpertWithDraw.rejected, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(getSalonWithDraw.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(getSalonWithDraw.fulfilled, (state, action) => {
            state.isLoading = false;
            state.salonWithDraw = action.payload.request;
        });

        builder.addCase(getSalonWithDraw.rejected, (state, action) => {
            state.isLoading = false;
        });

    },
});
export default withDrawSlice.reducer;
