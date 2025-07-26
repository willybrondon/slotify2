import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { DangerRight, Success } from "../../component/api/toastServices";

const initialState = {
    product: [],
    attribute: [],
    productCategory: [], productDetails: [],
    productOrderHistory:[],
    productReview: [],
    pendingUpdateReq: [],
    pendingReq: [],
    status: "",
    isLoading: false,
    isSkeleton: false,
    total: null,
};

export const getAllProduct = createAsyncThunk(
    "admin/getAllProduct/getAll",
    async (payload) => {
        return apiInstanceFetch.get(`admin/product/getProducts?start=${payload?.start}&limit=${payload?.limit}&status=${payload?.status}`);
    }
);
export const getPendingRequest = createAsyncThunk(
    "admin/getPendingRequest/getAll",
    async (payload) => {
        return apiInstanceFetch.get(`admin/product/statusWiseProduct?status=${payload}`);
    }
);
export const getUpdatePendingRequest = createAsyncThunk(
    "admin/getUpdatePendingRequest/getAll",
    async (payload) => {
        return apiInstanceFetch.get(`admin/productRequest/updateProductRequestStatusWise?status=${payload}`);
    }
);

export const getProductInfo = createAsyncThunk(
    "admin/getProductInfo/getAll",
    async (id) => {
        return apiInstanceFetch.get(`admin/product/productDetails?productId=${id}`);
    }
);
export const getProductReview = createAsyncThunk(
    "admin/getProductReview/getAll",
    async (payload) => {
        return apiInstanceFetch.get(`admin/review/getProductReview?productId=${payload?.productId}&start=${payload?.start}&limit=${payload?.limit}`);
    }
);

export const productCategoryAdd = createAsyncThunk(
    "admin/productCategory/create",
    async (payload) => {
        return apiInstance.post("admin/productCategory/create", payload);
    }
);
export const getProductsCategory = createAsyncThunk(
    "salon/getProductsCategory",
    async (payload) => {
        return apiInstanceFetch.get(
            `salon/productCategory/get`
        );
    }
);
export const getProductOrderHistory = createAsyncThunk(
    "salon/getProductOrderHistory",
    async (payload) => {
        return apiInstanceFetch.get(
            `admin/order/fetchOrdersOfUser?userId=${payload?.userId}&status=${payload?.status}&start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);

export const getStatusWiseData = createAsyncThunk(
    "salon/getStatusWiseData",
    async (payload) => {
        return apiInstanceFetch.get(
            `admin/product/statusWiseProduct?status=${payload?.status}&start=${payload?.start}&limit=${payload?.limit}`
        );
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
export const pendingProductStatus = createAsyncThunk(
    "admin/pendingProductStatus/status",
    async (payload) => {
        return apiInstance.patch(
            `admin/product/acceptCreateRequest?productId=${payload?.productId}&type=${payload?.type}`
        );
    }
);
export const pendingRejectProductStatus = createAsyncThunk(
    "admin/pendingRejectProductStatus/status",
    async (payload) => {
        return apiInstance.patch(
            `admin/productRequest/acceptUpdateRequest?productId=${payload?.productId}&type=${payload?.type}`
        );
    }
);
export const pendingProductUpdateStatus = createAsyncThunk(
    "admin/pendingProductUpdateStatus/status",
    async (payload) => {
        return apiInstance.patch(
            `admin/productRequest/acceptUpdateRequest?productId=${payload?.productId}&type=${payload?.type}`
        );
    }
);
export const updateOutOfStockProduct = createAsyncThunk(
    "admin/updateOutOfStockProduct/status",
    async (payload) => {
        return apiInstance.patch(
            `admin/product/manageProduct?productId=${payload?.productId}&type=${payload?.type}`
        );
    }
);
export const productUpdate = createAsyncThunk(
    "admin/productUpdate/update",
    async (payload) => {
        return apiInstance.patch(
            `admin/product/updateProduct?productId=${payload?.productId}&salonId=${payload?.salonId}&productCode=${payload?.productCode}`,
            payload?.formData
        );
    }
);
export const productCategoryUpdate = createAsyncThunk(
    "admin/productCategory/update",
    async (id) => {
        return apiInstance.patch(
            `admin/productCategory/update?categoryId=${id?.id}`,
            id?.formData
        );
    }
);

export const getAttribute = createAsyncThunk(
    "salon/getAttribute",
    async (payload) => {
        return apiInstanceFetch.get(
            `salon/attributes`
        );
    }
);

export const deleteProduct = createAsyncThunk(
    "admin/product/deleteProduct",
    async (payload) => {
        return apiInstanceFetch.delete(
            `admin/product/deleteProduct?productId=${payload}`
        );
    }
);




const productSlice = createSlice({
    name: "productSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllProduct.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getAllProduct.fulfilled, (state, action) => {
            state.product = action.payload.product;
            state.total = action.payload.totalProducts;
            state.isSkeleton = false;
        });

        builder.addCase(getAllProduct.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getProductOrderHistory.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProductOrderHistory.fulfilled, (state, action) => {
            state.productOrderHistory = action.payload.orderData;
            state.total = action.payload.totalOrder;
            state.isSkeleton = false;
        });

        builder.addCase(getProductOrderHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getPendingRequest.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getPendingRequest.fulfilled, (state, action) => {
            state.pendingReq = action.payload.products;
            state.total = action.payload.totalProducts;
            state.isSkeleton = false;
        });

        builder.addCase(getPendingRequest.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getUpdatePendingRequest.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getUpdatePendingRequest.fulfilled, (state, action) => {
            state.pendingUpdateReq = action.payload.products;
            state.total = action.payload.totalProducts;
            state.isSkeleton = false;
        });

        builder.addCase(getUpdatePendingRequest.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getProductInfo.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProductInfo.fulfilled, (state, action) => {
            state.productDetails = action.payload.product;
            state.total = action.payload.totalProducts;
            state.isSkeleton = false;
        });

        builder.addCase(getProductInfo.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getProductReview.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProductReview.fulfilled, (state, action) => {
            state.productReview = action.payload.reviews;
            state.total = action.payload.totalProducts;
            state.isSkeleton = false;
        });

        builder.addCase(getProductReview.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getProductsCategory.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProductsCategory.fulfilled, (state, action) => {
            state.productCategory = action?.payload?.data;
            state.isSkeleton = false;
        });

        builder.addCase(getProductsCategory.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getStatusWiseData.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getStatusWiseData.fulfilled, (state, action) => {
            state.status = action?.payload?.products;
            state.total = action.payload.totalProducts;
            state.isSkeleton = false;
        });

        builder.addCase(getStatusWiseData.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getAttribute.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getAttribute.fulfilled, (state, action) => {
            state.attribute = action?.payload?.attributes;
            state.isSkeleton = false;
        });

        builder.addCase(getAttribute.rejected, (state, action) => {
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


            builder.addCase(deleteProduct.pending, (state) => {
              state.isLoading = true;
            });
            builder.addCase(deleteProduct.fulfilled, (state, action) => {
              state.isLoading = false;
              if (action?.payload?.status) {
                state.product = state.product.filter(
                  (product) => product._id !== action.meta.arg
                );
                Success("Product Deleted Successfully");
                state.total -= 1;
              }else{

                  DangerRight(action?.payload?.message);
              }
            });
            builder.addCase(deleteProduct.rejected, (state) => {
              state.isLoading = false;

            });
    },
});
export default productSlice.reducer;
