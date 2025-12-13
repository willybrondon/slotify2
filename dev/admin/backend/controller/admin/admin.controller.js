const Admin = require("../../models/admin.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Cryptr = require("cryptr");
const fs = require("fs");
const cryptr = new Cryptr("myTotallySecretKey", {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

const Login = require("../../models/login.model");

function _0x5555() {
  const _0x9f021a = [
    "5053113WGkZZF",
    "51wHsvoJ",
    "559127BfCjEO",
    "14iLcYxF",
    "10087270RrvBEO",
    "776060OiayLr",
    "3875268BhXeVk",
    "13426VKsoEf",
    "16rBugiy",
    "873128pXLFjZ",
  ];
  _0x5555 = function () {
    return _0x9f021a;
  };
  return _0x5555();
}
function _0x1c22(_0x5b187a, _0x1ac55f) {
  const _0x5555d0 = _0x5555();
  return (
    (_0x1c22 = function (_0x1c2287, _0xf81855) {
      _0x1c2287 = _0x1c2287 - 0x79;
      let _0x307fa2 = _0x5555d0[_0x1c2287];
      return _0x307fa2;
    }),
    _0x1c22(_0x5b187a, _0x1ac55f)
  );
}
(function (_0x5a02af, _0xf4f9d) {
  const _0x2b19f4 = _0x1c22,
    _0x371ec7 = _0x5a02af();
  while (!![]) {
    try {
      const _0x3e7954 =
        parseInt(_0x2b19f4(0x7c)) / 0x1 +
        (-parseInt(_0x2b19f4(0x81)) / 0x2) * (parseInt(_0x2b19f4(0x7b)) / 0x3) +
        (-parseInt(_0x2b19f4(0x82)) / 0x4) *
          (-parseInt(_0x2b19f4(0x7f)) / 0x5) +
        parseInt(_0x2b19f4(0x80)) / 0x6 +
        (-parseInt(_0x2b19f4(0x7d)) / 0x7) *
          (-parseInt(_0x2b19f4(0x79)) / 0x8) +
        -parseInt(_0x2b19f4(0x7a)) / 0x9 +
        -parseInt(_0x2b19f4(0x7e)) / 0xa;
      if (_0x3e7954 === _0xf4f9d) break;
      else _0x371ec7["push"](_0x371ec7["shift"]());
    } catch (_0x245c1b) {
      _0x371ec7["push"](_0x371ec7["shift"]());
    }
  }
})(_0x5555, 0x57d96);
const LiveUser = require("jago-maldar");

exports.store = async (req, res) => {
  try {
    function _0x5af9(_0x1f9732, _0x585d7d) {
      const _0x3b4148 = _0x3b41();
      return (
        (_0x5af9 = function (_0x5af993, _0x20ca66) {
          _0x5af993 = _0x5af993 - 0x15e;
          let _0x203a62 = _0x3b4148[_0x5af993];
          return _0x203a62;
        }),
        _0x5af9(_0x1f9732, _0x585d7d)
      );
    }
    const _0x2eb4fa = _0x5af9;
    function _0x3b41() {
      const _0x43ef55 = [
        "781112sfueYp",
        "findOne",
        "body",
        "Oops\x20!\x20Invalid\x20details!",
        "57291GGMnnV",
        "Purchase\x20code\x20is\x20not\x20valid!",
        "139176NPOGSm",
        "130wfLFVS",
        "331200WUliGn",
        "email",
        "2fcKbgW",
        "login",
        "596176vicrsr",
        "29802HtckeH",
        "save",
        "password",
        "status",
        "6mpHkGB",
        "json",
        "code",
        "1281965xEwdzZ",
      ];
      _0x3b41 = function () {
        return _0x43ef55;
      };
      return _0x3b41();
    }
    (function (_0xe2e764, _0x2a6c2e) {
      const _0x18b599 = _0x5af9,
        _0x1f2a71 = _0xe2e764();
      while (!![]) {
        try {
          const _0x4d3114 =
            (parseInt(_0x18b599(0x16a)) / 0x1) *
              (parseInt(_0x18b599(0x167)) / 0x2) +
            -parseInt(_0x18b599(0x161)) / 0x3 +
            -parseInt(_0x18b599(0x165)) / 0x4 +
            (-parseInt(_0x18b599(0x171)) / 0x5) *
              (-parseInt(_0x18b599(0x16e)) / 0x6) +
            parseInt(_0x18b599(0x169)) / 0x7 +
            parseInt(_0x18b599(0x172)) / 0x8 +
            (-parseInt(_0x18b599(0x163)) / 0x9) *
              (parseInt(_0x18b599(0x164)) / 0xa);
          if (_0x4d3114 === _0x2a6c2e) break;
          else _0x1f2a71["push"](_0x1f2a71["shift"]());
        } catch (_0x4b0092) {
          _0x1f2a71["push"](_0x1f2a71["shift"]());
        }
      }
    })(_0x3b41, 0x288b9);
    if (
      !req[_0x2eb4fa(0x15f)] ||
      !req[_0x2eb4fa(0x15f)][_0x2eb4fa(0x166)] ||
      !req["body"]["code"] ||
      !req[_0x2eb4fa(0x15f)][_0x2eb4fa(0x16c)]
    )
      return res[_0x2eb4fa(0x16d)](0xc8)["json"]({
        status: ![],
        message: _0x2eb4fa(0x160),
      });
    const data = await LiveUser(
      req[_0x2eb4fa(0x15f)][_0x2eb4fa(0x170)],
      0x313e533
    );
    if (data) {
      const admin = new Admin();
      (admin["email"] = req["body"][_0x2eb4fa(0x166)]),
        (admin[_0x2eb4fa(0x16c)] = cryptr["encrypt"](
          req[_0x2eb4fa(0x15f)]["password"]
        )),
        (admin["purchaseCode"] = req["body"][_0x2eb4fa(0x170)]),
        await admin[_0x2eb4fa(0x16b)]();
      const login = await Login[_0x2eb4fa(0x15e)]({});
      if (!login) {
        const newLogin = new Login();
        (newLogin["login"] = !![]), await newLogin[_0x2eb4fa(0x16b)]();
      } else (login[_0x2eb4fa(0x168)] = !![]), await login[_0x2eb4fa(0x16b)]();
      return res[_0x2eb4fa(0x16d)](0xc8)[_0x2eb4fa(0x16f)]({
        status: !![],
        message: "Admin\x20Created\x20Successfully!",
        admin: admin,
      });
    } else
      return res[_0x2eb4fa(0x16d)](0xc8)[_0x2eb4fa(0x16f)]({
        status: ![],
        message: _0x2eb4fa(0x162),
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        status: false,
        message: error.message || "Internal Server Error",
      });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('[Admin Login] ========== LOGIN ATTEMPT ==========');
    console.log('[Admin Login] Request received');
    console.log('[Admin Login] Request body:', {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      hasBody: !!req.body
    });
    
    // Validate required fields
    if (!req.body || !req.body.email || !req.body.password) {
      console.log('[Admin Login] ❌ Missing required fields');
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details. Email and password are required.",
      });
    }
    
    const email = req.body.email.trim();
    const password = req.body.password;
    
    console.log('[Admin Login] Looking up admin with email:', email);
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email });
    
    if (!admin) {
      console.log('[Admin Login] ❌ Admin not found with email:', email);
      return res.status(200).json({
        status: false,
        message: "Oops ! admin does not found with that email.",
      });
    }
    
    console.log('[Admin Login] ✅ Admin found:', admin.name || admin.email);
    console.log('[Admin Login] Checking password...');
    
    // Decrypt and check password
    let decryptedPassword;
    try {
      decryptedPassword = cryptr.decrypt(admin.password);
    } catch (decryptError) {
      console.error('[Admin Login] ❌ Password decryption error:', decryptError);
      return res.status(200).json({
        status: false,
        message: "Password decryption failed. Please contact support.",
      });
    }
    
    if (password !== decryptedPassword) {
      console.log('[Admin Login] ❌ Password mismatch');
      return res.status(200).json({
        status: false,
        message: "Oops ! Password doesn't match",
      });
    }
    
    console.log('[Admin Login] ✅ Password correct');
    console.log('[Admin Login] Validating purchase code:', admin.purchaseCode || 'NOT SET');
    
    // Validate purchase code
    let purchaseCodeValid = false;
    try {
      const purchaseCodeResult = await LiveUser(admin.purchaseCode, 0x313e533);
      purchaseCodeValid = !!purchaseCodeResult;
      console.log('[Admin Login] Purchase code validation result:', purchaseCodeValid);
    } catch (liveUserError) {
      console.error('[Admin Login] ⚠️  LiveUser validation error:', liveUserError.message);
      // Continue anyway - purchase code validation might fail due to network issues
      // But we'll still allow login if other checks pass
      purchaseCodeValid = false;
    }
    
    if (!purchaseCodeValid) {
      console.log('[Admin Login] ❌ Purchase code validation failed');
      return res.status(200).json({
        status: false,
        message: "Purchase code is not valid. Please check your purchase code.",
      });
    }
    
    console.log('[Admin Login] ✅ Purchase code valid');
    
    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('[Admin Login] ❌ ERROR: JWT_SECRET not configured in .env');
      return res.status(500).json({
        status: false,
        message: "Server configuration error: JWT_SECRET missing. Please contact administrator.",
      });
    }
    
    console.log('[Admin Login] Generating JWT token...');
    
    // Create JWT token
    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      password: admin.password,
    };
    
    let token;
    try {
      token = jwt.sign(payload, process.env.JWT_SECRET);
      console.log('[Admin Login] ✅ Token generated successfully');
    } catch (jwtError) {
      console.error('[Admin Login] ❌ JWT generation error:', jwtError);
      return res.status(500).json({
        status: false,
        message: "Token generation failed. Please contact support.",
      });
    }
    
    console.log('[Admin Login] ========== LOGIN SUCCESS ==========');
    
    return res.status(200).json({
      status: true,
      message: "Admin login Successfully.",
      token: token,
    });
  } catch (error) {
    console.error('[Admin Login] ERROR:', error);
    console.error('[Admin Login] Error details:', {
      message: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "Admin does not Exist" });
    }
    return res.status(200).json({ status: true, message: "success", admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update admin
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res
        .status(200)
        .send({ status: false, message: "admin not exists" });
    }

    if (req.file) {
      if (admin.image) {
        var image_ = admin?.image?.split("storage");
        if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
          if (fs.existsSync("storage" + image_[1])) {
            fs.unlinkSync("storage" + image_[1]);
          }
        }
      }

      admin.image = req.file
        ? process?.env?.baseURL + req?.file?.path
        : admin?.image;
    }

    admin.name = req.body.name ? req.body.name : admin.name;
    admin.email = req.body.email ? req.body.email : admin.email;

    await admin.save();

    return res.status(200).send({ status: true, message: "success!!", admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" || error });
  }
};
//update admin profile
exports.updateAdminPassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }

    const admin = await Admin.findById(req.admin._id);
    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res
        .status(200)
        .send({ status: false, message: "old password is Invalid" });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: "password does not match" });
    }

    admin.password = cryptr.encrypt(req.body.newPass);
    await admin.save();
    return res
      .status(200)
      .send({ status: true, message: "password updated", admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" || error });
  }
};
