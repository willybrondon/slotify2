import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from "./slice/authSlice";
import expertSlice from "./slice/expertSlice";
import dialogueSlice from "./slice/dialogueSlice";
import categorySlice from "./slice/categorySlice";
import serviceSlice from "./slice/serviceSlice";
import reviewSlice from "./slice/reviewSlice";
import userSlice from "./slice/userSlice";
import settingSlice from "./slice/settingSlice";
import timeSlice from "./slice/timeSlice";
import bookingSlice from "./slice/bookingSlice";
import payoutSlice from "./slice/payoutSlice";
import dashSlice from "./slice/dashSlice";
import spinnerReducer from "./slice/loading.reducer";
import salarySlice from "./slice/salarySlice";
import attendanceSlice from "./slice/attendanceSlice";
import complainSlice from "./slice/complainSlice";
import notificationSlice from "./slice/notificationSlice";
import holidaySlice from "./slice/holidaySlice";
import salonSlice from "./slice/salonSlice";
import salonRequestSlice from "./slice/salonRequestSlice";
import productCategorySlice from "./slice/productCategorySlice";
import attributeSlice from "./slice/attributeSlice";
import productSlice from "./slice/productSlice";
import productRequestSlice from "./slice/productRequestSlice"
import orderSlice from "./slice/orderSlice"
import withDrawSlice from "./slice/withDrawSlice"
import couponSlice from "./slice/couponSlice";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['isAuth'], // Only persist the isAuth field
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    expert: expertSlice,
    dialogue: dialogueSlice,
    category: categorySlice,
    service: serviceSlice,
    review: reviewSlice,
    user: userSlice,
    setting: settingSlice,
    time: timeSlice,
    booking: bookingSlice,
    payout: payoutSlice,
    dash: dashSlice,
    spinner: spinnerReducer,
    salary: salarySlice,
    attendance: attendanceSlice,
    complain: complainSlice,
    notification: notificationSlice,
    holiday: holidaySlice,
    salon: salonSlice,
    salonRequest: salonRequestSlice,
    productCategory: productCategorySlice,
    attributes: attributeSlice,
    product: productSlice,
    productRequest: productRequestSlice,
    ordersData: orderSlice,
    withDraw:withDrawSlice,
    coupon:couponSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  // devTools:false
});

export const persistor = persistStore(store);

export default store;
