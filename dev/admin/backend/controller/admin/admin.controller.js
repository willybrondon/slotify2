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
    function _0x418a(_0x484276, _0x3ad0ec) {
      const _0x7f21d8 = _0x7f21();
      return (
        (_0x418a = function (_0x418ab3, _0x25df60) {
          _0x418ab3 = _0x418ab3 - 0x168;
          let _0x433d4e = _0x7f21d8[_0x418ab3];
          return _0x433d4e;
        }),
        _0x418a(_0x484276, _0x3ad0ec)
      );
    }
    function _0x7f21() {
      const _0x5349d1 = [
        "image",
        "email",
        "294XZFKmU",
        "json",
        "578355KMrnth",
        "findOne",
        "body",
        "410DQjZHg",
        "JWT_SECRET",
        "_id",
        "decrypt",
        "1043430DEFdiM",
        "name",
        "2266715UUfDTd",
        "Oops\x20!\x20admin\x20does\x20not\x20found\x20with\x20that\x20email.",
        "1372270qRuStf",
        "38210sxXZsM",
        "env",
        "15yEFXhl",
        "298719oOKoDm",
        "Oops\x20!\x20Password\x20doesn\x27t\x20match",
        "purchaseCode",
        "16wCXSGQ",
        "send",
        "257312HREYpt",
        "204HxKfEi",
        "password",
        "status",
      ];
      _0x7f21 = function () {
        return _0x5349d1;
      };
      return _0x7f21();
    }
    const _0x12697e = _0x418a;
    (function (_0x24d569, _0x47aaea) {
      const _0x26dd3d = _0x418a,
        _0xea04db = _0x24d569();
      while (!![]) {
        try {
          const _0x457635 =
            (parseInt(_0x26dd3d(0x17e)) / 0x1) *
              (parseInt(_0x26dd3d(0x17c)) / 0x2) +
            parseInt(_0x26dd3d(0x170)) / 0x3 +
            (parseInt(_0x26dd3d(0x182)) / 0x4) *
              (parseInt(_0x26dd3d(0x17b)) / 0x5) +
            parseInt(_0x26dd3d(0x177)) / 0x6 +
            (-parseInt(_0x26dd3d(0x16e)) / 0x7) *
              (-parseInt(_0x26dd3d(0x168)) / 0x8) +
            (-parseInt(_0x26dd3d(0x17f)) / 0x9) *
              (-parseInt(_0x26dd3d(0x173)) / 0xa) +
            (parseInt(_0x26dd3d(0x179)) / 0xb) *
              (-parseInt(_0x26dd3d(0x169)) / 0xc);
          if (_0x457635 === _0x47aaea) break;
          else _0xea04db["push"](_0xea04db["shift"]());
        } catch (_0x3f5043) {
          _0xea04db["push"](_0xea04db["shift"]());
        }
      }
    })(_0x7f21, 0xea4cf);
    if (
      req[_0x12697e(0x172)] &&
      req["body"][_0x12697e(0x16d)] &&
      req[_0x12697e(0x172)][_0x12697e(0x16a)]
    ) {
      const admin = await Admin[_0x12697e(0x171)]({
        email: req[_0x12697e(0x172)][_0x12697e(0x16d)],
      });
      if (!admin)
        return res["status"](0xc8)[_0x12697e(0x16f)]({
          status: ![],
          message: _0x12697e(0x17a),
        });
      const isPassword = cryptr[_0x12697e(0x176)](admin[_0x12697e(0x16a)]);
      if (req[_0x12697e(0x172)][_0x12697e(0x16a)] !== isPassword)
        return res[_0x12697e(0x16b)](0xc8)[_0x12697e(0x183)]({
          status: ![],
          message: _0x12697e(0x180),
        });
      const data = await LiveUser(admin?.[_0x12697e(0x181)], 0x313e533);
      if (data) {
        const payload = {
            _id: admin[_0x12697e(0x175)],
            name: admin[_0x12697e(0x178)],
            email: admin[_0x12697e(0x16d)],
            image: admin[_0x12697e(0x16c)],
            password: admin[_0x12697e(0x16a)],
          },
          token = jwt["sign"](
            payload,
            process[_0x12697e(0x17d)][_0x12697e(0x174)]
          );
        return res[_0x12697e(0x16b)](0xc8)["json"]({
          status: !![],
          message: "Admin\x20login\x20Successfully.",
          token: token,
        });
      } else
        return res["status"](0xc8)[_0x12697e(0x16f)]({
          status: ![],
          message: "Purchase\x20code\x20is\x20not\x20valid.",
        });
    } else
      return res[_0x12697e(0x16b)](0xc8)[_0x12697e(0x183)]({
        status: ![],
        message: "Oops\x20!\x20Invalid\x20details.",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
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
