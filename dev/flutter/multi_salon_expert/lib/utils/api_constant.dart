class ApiConstant {
  static const BASE_URL =
      "http://46.101.229.176:5000/"; // Enter your base URL like :: http://182.168.19.35:5000/
  static const SECRET_KEY = "r8Cs1WcSI9";
  // ---------- expert ---------- //
  static const loginExpert = "user/expert/login";
  static const getExpert = "user/expert/profile?";

  // ---------- booking ---------- //
  static const getBooking = "user/booking/getBookingBasedDate?";
  static const statusWiseBooking = "user/booking/expert/booking?";
  static const cancelConfirmBooking =
      "user/booking/expert/cancelConfirmBooking";
  static const completeBooking = "user/booking/expert/completeBooking?";
  static const bookingTypeStatusWise =
      "user/booking/expert/bookingWithTypeStatus?";
  static const getAttendance = "user/attendance/getAttendanceForExpert?";
  static const getBookingInformation = "user/booking/bookingInfo?";

  // ---------- earning ---------- //
  static const getExpertEarning = "user/booking/expert/expertEarning?";

  // ---------- Withdraw ---------- //
  static const getWithdrawMethod =
      "user/withdrawMethod/getWithdrawMethodsByExpert";
  static const updateWithdrawMethod =
      "user/expertWithdrawMethod/updateDetailsOfPaymentMethods";
  static const getPaymentDetails =
      "user/expertWithdrawMethod/getDetailsOfPaymentMethods?";
  static const createWithdrawRequest =
      "user/expertWithdrawRequest/withdrawRequestByExpert";
  static const getWalletHistory = "user/expert/walletHistoryByExpert?";

  // ---------- Setting ---------- //
  static const setting = "user/setting/get";

  // ---------- Attendance ---------- //
  static const expertAttendance = "user/attendance/attendExpert?";

  // ---------- History ---------- //
  static const paymentHistory = "user/expertSettlement?";

  // ---------- update ---------- //
  static const updateProfile = "user/expert/updateProfile?";
  static const expertBusySlots = "user/expert/busyExpert?";

  // ---------- Payment Type ---------- //
  static const updatePaymentStatus =
      "user/expert/payForCashAfterService?"; //check-out booking

  // ---------- Complain ---------- //
  static const raiseComplain = "user/complain/expert/raiseComplain";
}
