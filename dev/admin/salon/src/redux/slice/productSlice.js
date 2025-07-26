import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiInstance, apiInstanceFetch } from "../../component/api/axiosApi";
import { Success } from "../../component/api/toastServices";

const initialState = {
    product: [],
    productDetails: [],
    productCategory: [],
    productRating: [],
    attribute: [],
    allowCity: [],
    isLoading: false,
    isSkeleton: false,
    total: null,
};

export const getProducts = createAsyncThunk(
    "salon/getProducts",
    async (payload) => {
        return apiInstanceFetch.get(
            `salon/product/getAll?start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);
export const getProductsRating = createAsyncThunk(
    "salon/getProductsRating",
    async (payload) => {
        return apiInstanceFetch.get(
            `salon/review/fetchProductReview?start=${payload?.start}&limit=${payload?.limit}&productId=${payload?.productId}`
        );
    }
);
export const getProductsDetails = createAsyncThunk(
    "salon/getProductsDetails",
    async (id) => {
        return apiInstanceFetch.get(
            `salon/product/detailforSalon?productId=${id}`
        );
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
export const getAttribute = createAsyncThunk(
    "salon/getAttribute",
    async (payload) => {
        return apiInstanceFetch.get(
            `salon/attributes`
        );
    }
);

export const productCategoryAdd = createAsyncThunk("salon/addProductCategory", async (payload) => {
    console.log("payload", payload)
    return apiInstance.post("salon/product/createProduct", payload);
})

export const Salonpayment = createAsyncThunk(
    "expert/expertSettlement/update",
    async (payload) => {
        return apiInstance.patch(
            `expert/expertSettlement/update?expertId=${payload.expertId}&month=${payload?.month}`,
            payload.data
        );
    }
);
export const updateProductCategory = createAsyncThunk(
    "expert/updateProductCategory/update",
    async (payload) => {
        console.log("payloaddd", payload)
        return apiInstance.patch(
            `salon/product/updateProductBySalon?productId=${payload?.productId}&salonId=${payload?.salonId}&productCode=${payload?.productCode}`,
            payload?.formData
        );
    }
);
export const updateOutOfStockProduct = createAsyncThunk(
    "expert/updateOutOfStockProduct",
    async (id) => {
        return apiInstance.patch(
            `salon/product/isOutOfStock?productId=${id}`,
        );
    }
);

export const expertRevenue = createAsyncThunk(
    "salon/settlement/particularExpert",
    async (payload) => {
        return apiInstanceFetch.get(
            `salon/settlement/particularExpert?expertId=${payload.expertId}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);

export const particulareSalonEarningHistory = createAsyncThunk(
    "salon/settlement/salonSettlementInfo",
    async (id) => {
        return apiInstanceFetch.get(
            `salon/settlement/salonSettlementInfo?settlementId=${id}`
        );
    }
);
export const particulareExpertSettlementInfo = createAsyncThunk(
    "salon/settlement/expertSettlementInfo",
    async (id) => {
        return apiInstanceFetch.get(
            `salon/settlement/expertSettlementInfo?settlementId=${id}`
        );
    }
);

export const expertHistory = createAsyncThunk(
    "expert/expertSettlement/getForExpert",
    async (id) => {
        return apiInstanceFetch.get(
            `expert/expertSettlement/getForExpert?expertId=${id}`
        );
    }
);

export const monthlyState = createAsyncThunk("salon/booking/monthlyState", async () => {
    return apiInstanceFetch.get(`salon/booking/monthlyState`);
});

export const allowCity = createAsyncThunk("salon/product/allowCityForProduct", async (payload) => {
    return apiInstance.patch("salon/product/allowCityForProduct", payload)
})

export const blockCity = createAsyncThunk("salon/product/blockCityForProduct", async (payload) => {
    return apiInstance.patch("salon/product/blockCityForProduct", payload)
})

const productSlice = createSlice({
    name: "productSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getProducts.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProducts.fulfilled, (state, action) => {
            state.product = action?.payload?.products;
            state.total = action?.payload?.total
            state.isSkeleton = false;
        });

        builder.addCase(getProducts.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getProductsRating.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProductsRating.fulfilled, (state, action) => {
            state.productRating = action?.payload?.reviews;
            state.total = action?.payload?.total
            state.isSkeleton = false;
        });

        builder.addCase(getProductsRating.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(getProductsDetails.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getProductsDetails.fulfilled, (state, action) => {
            console.log("action", action)
            state.productDetails = action?.payload?.product;
            state.isSkeleton = false;
        });

        builder.addCase(getProductsDetails.rejected, (state, action) => {
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
        builder.addCase(getAttribute.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(getAttribute.fulfilled, (state, action) => {
            console.log("aattttt", action)
            state.attribute = action?.payload?.attributes;
            state.isSkeleton = false;
        });

        builder.addCase(getAttribute.rejected, (state, action) => {
            state.isSkeleton = false;
        });

        builder.addCase(expertHistory.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(expertHistory.fulfilled, (state, action) => {
            state.salary = action?.payload?.settlement;
            state.isSkeleton = false;
        });

        builder.addCase(expertHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        });

        builder.addCase(expertRevenue.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(expertRevenue.fulfilled, (state, action) => {
            state.salary = action?.payload?.settlement;
            state.total = action?.payload?.total;
            state.isSkeleton = false;
        });

        builder.addCase(expertRevenue.rejected, (state, action) => {
            state.isSkeleton = false;
        });


        builder.addCase(Salonpayment.pending, (state, action) => {
            state.isLoading = true;
        });

        builder.addCase(Salonpayment.fulfilled, (state, action) => {
            if (action?.payload?.status) {
                const salaryIdx = state.salary.findIndex(
                    (salary) => salary._id === action.payload?.history?._id
                );
                if (salaryIdx !== -1) {
                    state.salary[salaryIdx] = {
                        ...state?.salary[salaryIdx],
                        ...action?.payload?.history,
                    };
                }
            }
            state.isLoading = false;
            Success("Salary Paid Successfully");
        });

        builder.addCase(Salonpayment.rejected, (state, action) => {
            state.isLoading = false;
        });

        builder.addCase(monthlyState.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(monthlyState.fulfilled, (state, action) => {
            state.salary = action?.payload?.result;
            state.total = action?.payload?.total;

            state.isSkeleton = false;
        });

        builder.addCase(monthlyState.rejected, (state, action) => {
            state.isSkeleton = false;
        });

        builder.addCase(particulareSalonEarningHistory.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(particulareSalonEarningHistory.fulfilled, (state, action) => {
            state.salary = action?.payload?.settlement?.bookingId;
            state.isSkeleton = false;
        });

        builder.addCase(particulareSalonEarningHistory.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(particulareExpertSettlementInfo.pending, (state, action) => {
            state.isSkeleton = true;
        });

        builder.addCase(particulareExpertSettlementInfo.fulfilled, (state, action) => {
            state.salary = action?.payload?.settlement?.bookingId;
            state.isSkeleton = false;
        });

        builder.addCase(particulareExpertSettlementInfo.rejected, (state, action) => {
            state.isSkeleton = false;
        });
        builder.addCase(allowCity.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(allowCity.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action?.payload?.status){
                state.allowCity = action?.payload?.data;
                Success("Cities updated successfully")
            }
        })
        builder.addCase(allowCity.rejected, (state, action) => {
            state.isLoading = false;
        })
        builder.addCase(blockCity.pending, (state, action) => {
            state.isLoading = true;
        })
        builder.addCase(blockCity.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action?.payload?.status){
                state.allowCity = action?.payload?.data;
                Success("Cities updated successfully")
            }
        })
        builder.addCase(blockCity.rejected, (state, action) => {
            state.isLoading = false;
        })
    },
});
export default productSlice.reducer;
