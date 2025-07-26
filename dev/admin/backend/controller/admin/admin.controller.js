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
const LiveUser = require("jago-maldar");

exports.store = async (req, res) => {
  try {
    function _0x232a(_0x227744, _0x21b51b) {
      const _0x237435 = _0x2374();
      return (
        (_0x232a = function (_0x232aab, _0x24a42f) {
          _0x232aab = _0x232aab - 0xad;
          let _0xd74cf6 = _0x237435[_0x232aab];
          return _0xd74cf6;
        }),
        _0x232a(_0x227744, _0x21b51b)
      );
    }
    function _0x2374() {
      const _0x30ba7c = [
        "email",
        "save",
        "3540822hhIOjo",
        "code",
        "5wkpfux",
        "1188140XpUBaj",
        "323017JZMCUN",
        "11745048PuiqTv",
        "105DxfYzn",
        "108522cRLzie",
        "json",
        "549392TtYLpM",
        "840290ZndSEB",
        "password",
        "Oops\x20!\x20Invalid\x20details!",
        "171DuTeks",
        "body",
        "status",
        "login",
        "purchaseCode",
      ];
      _0x2374 = function () {
        return _0x30ba7c;
      };
      return _0x2374();
    }
    const _0x476f66 = _0x232a;
    (function (_0x58002c, _0x4533f2) {
      const _0x32e2c4 = _0x232a,
        _0x419b4d = _0x58002c();
      while (!![]) {
        try {
          const _0x46889c =
            parseInt(_0x32e2c4(0xb8)) / 0x1 +
            parseInt(_0x32e2c4(0xbe)) / 0x2 +
            -parseInt(_0x32e2c4(0xb4)) / 0x3 +
            (parseInt(_0x32e2c4(0xbd)) / 0x4) * (parseInt(_0x32e2c4(0xb6)) / 0x5) +
            (parseInt(_0x32e2c4(0xbb)) / 0x6) * (parseInt(_0x32e2c4(0xba)) / 0x7) +
            -parseInt(_0x32e2c4(0xb9)) / 0x8 +
            (parseInt(_0x32e2c4(0xad)) / 0x9) * (parseInt(_0x32e2c4(0xb7)) / 0xa);
          if (_0x46889c === _0x4533f2) break;
          else _0x419b4d["push"](_0x419b4d["shift"]());
        } catch (_0xc4354e) {
          _0x419b4d["push"](_0x419b4d["shift"]());
        }
      }
    })(_0x2374, 0xb9c2c);
    if (!req[_0x476f66(0xae)] || !req[_0x476f66(0xae)][_0x476f66(0xb2)] || !req[_0x476f66(0xae)][_0x476f66(0xb5)] || !req[_0x476f66(0xae)][_0x476f66(0xbf)])
      return res[_0x476f66(0xaf)](0xc8)[_0x476f66(0xbc)]({
        status: ![],
        message: _0x476f66(0xc0),
      });
    const data = await LiveUser(req[_0x476f66(0xae)][_0x476f66(0xb5)], 0x313e533);
    if (data) {
      const admin = new Admin();
      (admin[_0x476f66(0xb2)] = req[_0x476f66(0xae)][_0x476f66(0xb2)]),
        (admin[_0x476f66(0xbf)] = cryptr["encrypt"](req[_0x476f66(0xae)]["password"])),
        (admin[_0x476f66(0xb1)] = req["body"][_0x476f66(0xb5)]),
        await admin[_0x476f66(0xb3)]();
      const login = await Login["findOne"]({});
      if (!login) {
        const newLogin = new Login();
        (newLogin[_0x476f66(0xb0)] = !![]), await newLogin[_0x476f66(0xb3)]();
      } else (login[_0x476f66(0xb0)] = !![]), await login["save"]();
      return res["status"](0xc8)[_0x476f66(0xbc)]({
        status: !![],
        message: "Admin\x20Created\x20Successfully!",
        admin: admin,
      });
    } else
      return res["status"](0xc8)[_0x476f66(0xbc)]({
        status: ![],
        message: "Purchase\x20code\x20is\x20not\x20valid!",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    function _0x4225() {
      const _0x3ebe57 = [
        "10650045NsZuCt",
        "6IzqqCa",
        "607045JvWIaw",
        "20ckxqfQ",
        "12819158UgsAYh",
        "11206170PnYdas",
        "8FnggOk",
        "image",
        "Oops\x20!\x20Invalid\x20details.",
        "sign",
        "Oops\x20!\x20admin\x20does\x20not\x20found\x20with\x20that\x20email.",
        "env",
        "3hAesaw",
        "_id",
        "Admin\x20login\x20Successfully.",
        "status",
        "decrypt",
        "706733IjyCwL",
        "2479476FRlTKb",
        "email",
        "send",
        "body",
        "4839152WCYARV",
        "password",
        "json",
        "JWT_SECRET",
      ];
      _0x4225 = function () {
        return _0x3ebe57;
      };
      return _0x4225();
    }
    const _0x360ee6 = _0x21a4;
    (function (_0x1bb2b3, _0x35784f) {
      const _0x585b2f = _0x21a4,
        _0x44d106 = _0x1bb2b3();
      while (!![]) {
        try {
          const _0x260641 =
            parseInt(_0x585b2f(0x1e9)) / 0x1 +
            -parseInt(_0x585b2f(0x1ea)) / 0x2 +
            (parseInt(_0x585b2f(0x1fe)) / 0x3) * (-parseInt(_0x585b2f(0x1ee)) / 0x4) +
            (-parseInt(_0x585b2f(0x1f4)) / 0x5) * (-parseInt(_0x585b2f(0x1f3)) / 0x6) +
            parseInt(_0x585b2f(0x1f2)) / 0x7 +
            (-parseInt(_0x585b2f(0x1f8)) / 0x8) * (parseInt(_0x585b2f(0x1f7)) / 0x9) +
            (parseInt(_0x585b2f(0x1f5)) / 0xa) * (parseInt(_0x585b2f(0x1f6)) / 0xb);
          if (_0x260641 === _0x35784f) break;
          else _0x44d106["push"](_0x44d106["shift"]());
        } catch (_0x2f83ad) {
          _0x44d106["push"](_0x44d106["shift"]());
        }
      }
    })(_0x4225, 0xf0a4d);
    function _0x21a4(_0x4735d7, _0x1f7a2c) {
      const _0x4225e6 = _0x4225();
      return (
        (_0x21a4 = function (_0x21a42d, _0x3dcabf) {
          _0x21a42d = _0x21a42d - 0x1e8;
          let _0x27b296 = _0x4225e6[_0x21a42d];
          return _0x27b296;
        }),
        _0x21a4(_0x4735d7, _0x1f7a2c)
      );
    }
    if (req["body"] && req[_0x360ee6(0x1ed)][_0x360ee6(0x1eb)] && req[_0x360ee6(0x1ed)][_0x360ee6(0x1ef)]) {
      const admin = await Admin["findOne"]({
        email: req[_0x360ee6(0x1ed)][_0x360ee6(0x1eb)],
      });
      if (!admin)
        return res[_0x360ee6(0x201)](0x190)["json"]({
          status: ![],
          message: _0x360ee6(0x1fc),
        });
      const isPassword = cryptr[_0x360ee6(0x1e8)](admin[_0x360ee6(0x1ef)]);
      if (req[_0x360ee6(0x1ed)][_0x360ee6(0x1ef)] !== isPassword)
        return res[_0x360ee6(0x201)](0xc8)[_0x360ee6(0x1ec)]({
          status: ![],
          message: "Oops\x20!\x20Password\x20doesn\x27t\x20match",
        });
      const data = await LiveUser(admin?.["purchaseCode"], 0x313e533);
      if (data) {
        const payload = {
            _id: admin[_0x360ee6(0x1ff)],
            name: admin["name"],
            email: admin[_0x360ee6(0x1eb)],
            image: admin[_0x360ee6(0x1f9)],
            password: admin[_0x360ee6(0x1ef)],
          },
          token = jwt[_0x360ee6(0x1fb)](payload, process[_0x360ee6(0x1fd)][_0x360ee6(0x1f1)]);
        return res["status"](0xc8)[_0x360ee6(0x1f0)]({
          status: !![],
          message: _0x360ee6(0x200),
          token: token,
        });
      } else
        return res[_0x360ee6(0x201)](0xc8)["json"]({
          status: ![],
          message: "Purchase\x20code\x20is\x20not\x20valid.",
        });
    } else
      return res[_0x360ee6(0x201)](0x190)[_0x360ee6(0x1ec)]({
        status: ![],
        message: _0x360ee6(0x1fa),
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
      return res.status(200).json({ status: false, message: "Admin does not Exist" });
    }

    return res.status(200).json({ status: true, message: "success", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).send({ status: false, message: "admin not exists" });
    }

    if (req.file) {
      var image_ = admin.image.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }

      admin.image = req.file ? process?.env?.baseURL + req?.file?.path : admin.image;
    }

    admin.name = req.body.name ? req.body.name : admin.name;
    admin.email = req.body.email ? req.body.email : admin.email;

    await admin.save();

    return res.status(200).send({ status: true, message: "success!!", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" || error });
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const admin = await Admin.findById(req.admin._id);
    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res.status(200).send({ status: false, message: "old password is Invalid" });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).send({ status: false, message: "password does not match" });
    }

    admin.password = cryptr.encrypt(req.body.newPass);
    await admin.save();
    return res.status(200).send({ status: true, message: "password updated", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" || error });
  }
};
