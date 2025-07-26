import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
    productRequest: [],
    attribute: [],
    productCategory: [], productDetails: [],
    status: "",
    isLoading: false,
    isSkeleton: false,
    total: null,
};

export const getProductRequest = createAsyncThunk(
    "admin/getProductRequest/getAll",
    async (payload) => {
        return apiInstanceFetch.get(`admin/product/statusWiseProduct?status=${payload?.status}`);
    }
);


export const productCategoryAdd = createAsyncThunk(
    "admin/productCategory/create",
    async (payload) => {
        return apiInstance.post("admin/productCategory/create", payload);
    }
);


export const productCategoryStatus = createAsyncThunk(
    "admin/productCategory/status",
    async (id) => {
        return apiInstance.patch(
            `admin/productCategory/isActive?productCategoryId=${id}`
        );
    }
);




const productRequestSlice = createSlice({
    name: "productRequestSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getProductRequest.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProductRequest.fulfilled, (state, action) => {
            state.productRequest = action.payload.product;
            state.total = action.payload.totalProducts;
            state.isSkeleton = false;
        });

        builder.addCase(getProductRequest.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(productCategoryAdd.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(productCategoryAdd.fulfilled, (state, action) => {
            if (action.payload.status) {
                state?.productCategory?.unshift(action?.payload?.data);
                state.total += 1;
                Success("ProductCategory Add Successfully");
            }
            state.isLoading = false;
        });

        builder.addCase(productCategoryAdd.rejected, (state, action) => {
            state.isLoading = false;
        });
    },
});
export default productRequestSlice.reducer;
