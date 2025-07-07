import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slice/authSlice";
import expertSlice from "./slice/expertSlice";
import dialogueSlice from "./slice/dialogueSlice";
import categorySlice from "./slice/categorySlice";
import serviceSlice from "./slice/serviceSlice";
import reviewSlice from "./slice/reviewSlice";
import taxSlice from "./slice/taxSlice";
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

const store = configureStore({
    reducer: {
        auth: authSlice,
        expert: expertSlice,
        dialogue: dialogueSlice,
        category: categorySlice,
        service: serviceSlice,
        review: reviewSlice,
        tax: taxSlice,
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
    },

});

export default store;