import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
    ordersData: [],
    orderDetails: [],
    total: null,
    isLoading: false,
    isSkeleton: false,
};

export const getOrder = createAsyncThunk("admin/getOrder/get", async (payload) => {
    return apiInstanceFetch.get(`admin/order/getOrders?start=${payload.start}&limit=${payload.limit}&status=${payload.status}`);
});
export const getOrderDetails = createAsyncThunk("admin/getOrderDetails/getDetails", async (id) => {
    return apiInstanceFetch.get(`admin/order/fetchOrderInfo?orderId=${id}`);
});
export const updateOrderStatus = createAsyncThunk("admin/updateOrderStatus/update", async (payload) => {
    return apiInstanceFetch.patch(`admin/order/updateOrderStatus?userId=${payload?.userId}&orderId=${payload?.orderId}&status=${payload?.status}&itemId=${payload?.itemId}`);
});
export const updateOrderOutOfStatus = createAsyncThunk("admin/updateOrderOutOfStatus/update", async (payload) => {
    return apiInstanceFetch.patch(`admin/order/updateOrderStatus?userId=${payload?.userId}&orderId=${payload?.orderId}&status=${payload?.status}&itemId=${payload?.itemId}`, payload?.data);
});



const orderSlice = createSlice({
    name: "orderSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getOrder.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(getOrder.fulfilled, (state, action) => {
            state.isLoading = false;
            state.ordersData = action.payload.orders;
            state.total = action.payload.totalOrders;
        });

        builder.addCase(getOrder.rejected, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(getOrderDetails.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(getOrderDetails.fulfilled, (state, action) => {
            state.isLoading = false;
            state.orderDetails = action.payload.order;
        });

        builder.addCase(getOrderDetails.rejected, (state, action) => {
            state.isLoading = false;
        });

    },
});
export default orderSlice.reducer;
