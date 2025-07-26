import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
    order: [],
    orderDetail:[],
    upComingOrders: [],
    total: null,
    isLoading: false,
    isSkeleton: false,
};

export const getOrders = createAsyncThunk(
    "salon/getOrders/get",
    async (payload) => {
        return apiInstanceFetch.get(
            `salon/order/ordersOfSalon?status=${payload?.status}&start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);
export const getOrderDetails = createAsyncThunk(
    "salon/getOrderDetails/get",
    async (id) => {
        return apiInstanceFetch.get(
            `salon/order/fetchOrderInfoBySalon?orderId=${id}`
        );
    }
);

export const getUpComingOrders = createAsyncThunk(
    "salon/getUpComingOrders/get",
    async () => {
        return apiInstanceFetch.get(`salon/dashboard/upcomingOrders`);
    }
);
export const bonusPenalty = createAsyncThunk(
    "salon/settlement/expertBonusPenalty",
    async (payload) => {
        return apiInstance.put(
            `salon/settlement/expertBonusPenalty?settlementId=${payload?.settlementId}`,
            payload?.data
        );
    }
);
export const payment = createAsyncThunk(
    "salon/settlement/expertPayment",
    async (payload) => {
        return apiInstance.put(
            `salon/settlement/expertPayment?settlementId=${payload.settlementId}`,
            payload.data
        );
    }
);

export const updateOrderStatus = createAsyncThunk("salon/updateOrderStatus/update", async (payload) => {
    console.log("payloadpayload", payload);
    return apiInstanceFetch.patch(`salon/order/updateOrderBySalon?userId=${payload?.userId}&orderId=${payload?.orderId}&status=${payload?.status}&itemId=${payload?.itemId}`);
});

export const updateOrderOutOfStatus = createAsyncThunk("salon/updateOrderOutOfStatus/update", async (payload) => {
    console.log("payloadpayload", payload);
    return apiInstanceFetch.patch(`salon/order/updateOrderBySalon?userId=${payload?.userId}&orderId=${payload?.orderId}&status=${payload?.status}&itemId=${payload?.itemId}`, payload?.data);
});

const orderSlice = createSlice({
    name: "orderSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getOrders.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getOrders.fulfilled, (state, action) => {
            state.order = action?.payload?.orders;
            state.isSkeleton = false;
        });

        builder.addCase(getOrders.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getOrderDetails.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getOrderDetails.fulfilled, (state, action) => {
            state.orderDetail = action?.payload?.order;
            state.isSkeleton = false;
        });

        builder.addCase(getOrderDetails.rejected, (state, action) => {
            state.isSkeleton = false;
        });

        builder.addCase(getUpComingOrders.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getUpComingOrders.fulfilled, (state, action) => {
            state.upComingOrders = action?.payload?.data;
            state.isSkeleton = false;
        });

        builder.addCase(getUpComingOrders.rejected, (state, action) => {
            state.isSkeleton = false;
        });

    },
});

export default orderSlice.reducer;
