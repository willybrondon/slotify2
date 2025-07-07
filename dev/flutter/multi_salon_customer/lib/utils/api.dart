class ApiConstant {
  static const BASE_URL =
      "http://46.101.229.176:5000/"; // Enter your base URL like :: http://182.168.19.35:5000/
  static const SECRET_KEY =
      "r8Cs1WcSI9"; // Enter your key like :: ssf45sd1fs5d1sdf1s56165s15sdf1s

  // ---------- user ---------- //
  static const loginUser = "user/loginSignup";
  static const getUser = "user/profile?";
  static const deleteUser = "user/delete";
  static const updateUser = "user/update?";
  static const checkUser = "user/checkUser?";
  static const checkSignUpUser = "user/checkUserForSignup?";

  // ---------- OTP ---------- //
  static const createOtp = "user/forgetPassword/create";
  static const verifyOtp = "user/forgetPassword/verify?";
  static const signUpOtpLogin = "user/otp/otplogin?";
  static const signUpOtpVerify = "user/otp/verify?";

  // ---------- Reset Password ---------- //
  static const resetPassword = "user/setPassword";

  // ---------- Expert ---------- //
  static const getExpert = "user/expert/expertWithService?";
  static const getAllExpert = "user/expert/getTopExperts?";
  static const getExpertServiceBasedSalon = "user/expert/getExpertServiceWise";

  // ---------- Category ---------- //
  static const getAllCategory = "user/category/getAll";

  // ---------- Service ---------- //
  static const getService = "user/service/serviceBasedCategory?";
  static const getAllService = "user/service/getAll?";

  // ---------- Salon ---------- //
  static const getAllSalon = "user/salon/getAll?";
  static const getServiceBasedSalon = "user/salon/serviceBaseSalon";
  static const getSalonDetail = "user/salon/salonWithExpertReview?";
  static const salonRegistration = "user/salonrequest/createSalonRequest";

  // ---------- Booking ---------- //
  static const getBooking = "user/booking/getBookingBasedDate?";
  static const createBooking = "user/booking/newBooking";
  static const checkBooking = "user/booking/checkSlots";
  static const getAllBooking = "user/booking/getBookings?";
  static const cancelBooking = "user/booking/cancelBooking";
  static const getBookingInformation = "user/booking/bookingInfo?";

  // ---------- Notification ---------- //
  static const getAllNotification = "user/notification/getForUser?";

  // ---------- Setting ---------- //
  static const setting = "user/setting/get";

  // ---------- Review ---------- //
  static const getReview = "user/review/expertReviews?";
  static const userSubmitReview = "user/review/postReview";

  // ---------- Complain ---------- //
  static const raiseComplain = "user/complain/raiseComplain";
  static const getComplain = "user/complain/get?";
}
