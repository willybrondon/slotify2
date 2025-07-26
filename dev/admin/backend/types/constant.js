exports.EXPERT_PAYMENT_TYPE = {
  BANK: 0,
  CASH: 1,
  UPI: 2,
};

exports.BANNER_TYPE = {
  SERVICE: 0,
  URL: 1,
};

exports.NOTIFICATION_TYPE = {
  USER: 0,
  EXPERT: 1,
  SALON: 2,
};

exports.COMPLAIN_TYPE = {
  PENDING: 0,
  SOLVED: 1,
};

exports.COMPLAIN_PERSON = {
  EXPERT: 0,
  USER: 1,
};

exports.TRANSACTION_STATUS = {
  PENDING: 0,
  PAID: 1,
};

exports.PAYMENT_STATUS = {
  PENDING: 0,
  PAID: 1,
  DECLINED: 2,
};

exports.BOOKING_TYPE = {
  PENDING: "pending",
  CONFIRM: "confirm",
  COMPLETE: "completed",
  CANCEL: "cancel",
};

exports.LOGIN_TYPE = {
  EMAIL_PASSWORD: 1,
  GOOGLE: 2,
  MOBILE: 3, // OTP LOGIN
};

exports.COUPON_TYPE = {
  WALLET: 1,
  APPOINTMENT: 2,
  ORDER: 3,
};

exports.DISCOUNT_TYPE = {
  FLAT: 1,
  PERCENTAGE: 2,
};

exports.PAYMENT_GATEWAY = {
  STRIPE: 1,
  RAZORPAY: 2,
  FLUTTERWAVE: 3,
};

exports.REVIEW_TYPE = {
  APPOINTMENT: 1,
  PRODUCT_PURCHASE: 2,
};

exports.WITHDRAW_REQUEST_STATUS = {
  DEFAULT: 0,
  PENDING: 1,
  ACCEPTED: 2,
  DECLINED: 3,
};
