class ApiConstant {
  static const BASE_URL =
      "https://skedisy.com/"; // Enter your base URL like :: http://182.168.19.35:5000/
  static const SECRET_KEY =
      "r8Cs1WcSI9"; // Enter your key like :: ssf45sd1fs5d1sdf1s56165s15sdf1s

  /// ---------- user ---------- ///
  static const loginUser = "user/loginSignup";
  static const guestSendOtp = "user/guest/sendOtp";
  static const guestVerifyOtp = "user/guest/verify";
  static const getUser = "user/profile?";
  static const deleteUser = "user/delete";
  static const updateUser = "user/update?";
  static const checkUser = "user/checkUser?";
  static const checkSignUpUser = "user/checkUserForSignup?";
  static const verifyMobileForSignup = "user/verifyMobileForSignup?";

  /// ---------- OTP ---------- ///
  static const createOtp = "user/forgetPassword/create";
  static const verifyOtp = "user/forgetPassword/verify?";
  static const signUpOtpLogin = "user/otp/otplogin?";
  static const signUpOtpVerify = "user/otp/verify?";

  /// ---------- Reset Password ---------- ///
  static const resetPassword = "user/setPassword";

  /// ---------- Wallet ---------- ///
  static const depositToWallet = "user/depositeToWallet?";
  static const getWalletHistory = "user/walletHistoryByUser?";

  /// =================== Coupon =================== ///
  static const getCoupon = "user/coupon/retriveCoupons?";
  static const validateCoupon = "user/coupon/retriveValidateCoupon?";

  /// ---------- Products ---------- ///
  static const getTrendingProduct = "user/product/trending?";
  static const getNewProduct = "user/product/new?";
  static const favouriteProduct = "user/favourite";
  static const getProductDetail = "user/product/productDetail?";
  static const getFavouriteProduct = "user/favourite/favouriteList?";
  static const getSearchProduct = "user/product/search?";

  /// ---------- Category ---------- ///
  static const getProductCategory = "user/productCategory/get";
  static const getCategoryWiseProduct = "user/productCategory/product?";

  /// ---------- Cart ---------- ///
  static const addCartProduct = "user/cart/addToCart";
  static const getCartProduct = "user/cart/getCart?";
  static const deleteCartProduct = "user/cart/removeFromCart";

  /// ---------- Order ---------- ///
  static const createOrder = "user/order/createOrder";
  static const getOrder = "user/order/get?";
  static const cancelOrder = "user/order/cancelOrder?";

  /// ---------- Address ---------- ///
  static const createAddress = "user/address/create";
  static const getAllAddress = "user/address/getAllAddress?";
  static const updateAddress = "user/address/update?";
  static const selectAddressOrNot = "user/address/selectOrNot?";

  /// ---------- Expert ---------- ///
  static const getExpert = "user/expert/expertWithService?";
  static const getAllExpert = "user/expert/getTopExperts?";
  static const getExpertServiceBasedSalon = "user/expert/getExpertServiceWise";

  /// ---------- Category ---------- ///
  static const getAllCategory = "user/category/getAll";

  /// ---------- Service ---------- ///
  static const getService = "user/service/serviceBasedCategory?";
  static const getAllService = "user/service/getAll?";

  /// Public search suggestions (top categories + services)
  static const searchSuggestions = "api/public/search-suggestions?";
  static const searchSalonsPublic = "api/public/search-salons?";
  static const salonsByCategory = "api/public/salons-by-category?";

  /// ---------- Salon ---------- ///
  static const getAllSalon = "user/salon/getAll?";
  static const getServiceBasedSalon = "user/salon/serviceBaseSalon";
  static const getSalonDetail = "user/salon/salonData?";
  static const getSalonShareUrl = "user/salon/getShareUrl?";
  static const salonRegistration = "user/salonrequest/createSalonRequest";
  static const salonFavourite = "user/favourite/salon";
  static const getFavouriteSalonList = "user/favourite/favouriteSalonList?";

  /// ---------- Booking ---------- ///
  static const getBooking = "user/booking/getBookingBasedDate?";
  static const createBooking = "user/booking/newBooking";
  static const checkBooking = "user/booking/checkSlots";
  static const getAllBooking = "user/booking/getBookings?";
  static const cancelBooking = "user/booking/cancelBooking";
  static const getBookingInformation = "user/booking/bookingInfo?";

  /// ---------- Notification ---------- ///
  static const getAllNotification = "user/notification/getForUser?";
  static const deleteNotification = "user/notification/delete?";

  /// ---------- Setting ---------- ///
  static const setting = "user/setting/get";

  /// ---------- Review ---------- ///
  static const getReview = "user/review/expertReviews?";
  static const userSubmitReview = "user/review/postReview";
  static const postProductReview = "user/review/postProductReview";

  /// ---------- Complain ---------- ///
  static const raiseComplain = "user/complain/raiseComplain";
  static const getComplain = "user/complain/get?";

  /// ---------- AI Concierge ---------- ///
  static const analyzeSelfie = "user/aiConcierge/analyzeSelfie";
  static const aiConciergeChat = "user/aiConcierge/chat";
  static const aiConciergeStatus = "user/aiConcierge/status";
}
