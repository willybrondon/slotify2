const userController = require("./user.controller");

function runController(handler, req) {
  return new Promise((resolve, reject) => {
    const mockRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ statusCode: this.statusCode || 200, payload });
        return this;
      },
      send(payload) {
        resolve({ statusCode: this.statusCode || 200, payload });
        return this;
      },
    };
    Promise.resolve(handler(req, mockRes)).catch(reject);
  });
}

function attachSecret(req) {
  req.headers = req.headers || {};
  req.headers.key = process.env.secretKey;
  req.body = req.body || {};
  req.body.key = process.env.secretKey;
}

function sanitizeUser(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  return {
    _id: u._id,
    id: u._id,
    fname: u.fname,
    lname: u.lname,
    email: u.email,
    mobile: u.mobile,
    image: u.image,
    loginType: u.loginType,
    amount: Number(u.amount) || 0,
  };
}

exports.publicLogin = async (req, res) => {
  try {
    const email = (req.body?.email || "").trim();
    const password = req.body?.password || "";

    if (!email || !password) {
      return res.status(200).json({ status: false, message: "Email and password are required." });
    }

    attachSecret(req);
    req.body.loginType = "1";
    req.body.email = email;
    req.body.password = password;

    const checkResult = await runController(userController.checkUser, req);
    const check = checkResult.payload;

    if (!check?.status || !check?.isLogin) {
      return res.status(200).json({
        status: false,
        message: check?.message || "Invalid email or password.",
      });
    }

    req.body.fcmToken = "web";
    const loginResult = await runController(userController.loginSignup, req);
    const login = loginResult.payload;

    if (!login?.status || !login?.user) {
      return res.status(200).json({
        status: false,
        message: login?.message || "Unable to sign in.",
      });
    }

    return res.status(200).json({
      status: true,
      message: login.message || "Signed in successfully.",
      user: sanitizeUser(login.user),
    });
  } catch (error) {
    console.error("[publicLogin]", error);
    return res.status(500).json({ status: false, message: error.message || "Server error" });
  }
};

exports.publicRegister = async (req, res) => {
  try {
    const fname = (req.body?.fname || "").trim();
    const lname = (req.body?.lname || "").trim();
    const email = (req.body?.email || "").trim();
    const mobile = (req.body?.mobile || "").trim();
    const password = req.body?.password || "";

    if (!email || !password || !mobile) {
      return res.status(200).json({
        status: false,
        message: "Email, phone and password are required.",
      });
    }

    attachSecret(req);

    const checkReq = {
      headers: req.headers,
      query: {
        email,
        loginType: "1",
        password,
        mobile,
        key: process.env.secretKey,
      },
    };

    const checkResult = await runController(userController.checkUserForSignup, checkReq);
    if (!checkResult.payload?.status) {
      return res.status(200).json({
        status: false,
        message: checkResult.payload?.message || "This email is already registered.",
      });
    }

    req.body = {
      ...req.body,
      key: process.env.secretKey,
      loginType: "1",
      email,
      mobile,
      password,
      fname: fname || email.split("@")[0],
      lname: lname || "",
      fcmToken: "web",
    };

    const signupResult = await runController(userController.loginSignup, req);
    const signup = signupResult.payload;

    if (!signup?.status || !signup?.user) {
      return res.status(200).json({
        status: false,
        message: signup?.message || "Unable to create account.",
      });
    }

    return res.status(200).json({
      status: true,
      message: signup.message || "Account created successfully.",
      user: sanitizeUser(signup.user),
    });
  } catch (error) {
    console.error("[publicRegister]", error);
    return res.status(500).json({ status: false, message: error.message || "Server error" });
  }
};

exports.serveLoginPage = (req, res) => {
  const { renderAuthPage } = require("../../lib/publicAuthPage");
  return renderAuthPage(req, res, "login");
};

exports.serveSignupPage = (req, res) => {
  const { renderAuthPage } = require("../../lib/publicAuthPage");
  return renderAuthPage(req, res, "signup");
};
