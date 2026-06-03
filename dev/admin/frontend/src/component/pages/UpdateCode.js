import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ExInput } from "../extras/Input";
import Button from "../extras/Button";
import logo from "../../assets/images/logo.png";
import { DangerRight } from "../api/toastServices";
import { updateCode } from "../../redux/slice/authSlice";
import { SKEDISY_ADMIN_PORTAL_COPY as copy } from "../../constants/skedisyPortalCopy";

const UpdateCode = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState({
    email: "",
    password: "",
    code: "",
  });

  const submit = async () => {
    if (!email || !password || !code) {
      const nextError = {};
      if (!email) nextError.email = copy.errEmail;
      if (!password) nextError.password = copy.errPassword;
      if (!code) nextError.code = copy.errCode;
      return setError(nextError);
    }
    const loginData = { email, password, code };
    const response = await dispatch(updateCode(loginData)).unwrap();
    response?.status ? navigate("/login") : DangerRight(response?.message);
  };

  return (
    <>
      <div className="mainLoginPage">
        <div className="loginDiv" style={{ width: "100%" }}>
          <div className="loginPage m-auto">
            <div className="loginTitle mb-3 d-flex">
              <img src={logo} style={{ width: "50px" }} alt="Skedisy" />
            </div>
            <p className="sk-portal-kicker mb-1">{copy.kicker}</p>
            <div className="fw-bold text-theme me-auto my-auto welComeTitle">
              {copy.welcome}
            </div>
            <h1 className="sk-portal-login-title">{copy.updateCodeTitle}</h1>
            <p className="sk-portal-subtitle">{copy.updateCodeSubtitle}</p>
            <h6 className="fw-bold text-theme me-auto my-auto fs-15 py-2 title">
              {copy.updateCodeHint}
            </h6>
            <div>
              <div className="col-12">
                <ExInput
                  type="text"
                  id="email"
                  name="email"
                  label={copy.email}
                  value={email}
                  placeholder={copy.email}
                  errorMessage={error.email && error.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError({
                      ...error,
                      email: !e.target.value ? copy.errEmail : "",
                    });
                  }}
                />
              </div>
              <div className="col-12">
                <ExInput
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  label={copy.password}
                  placeholder={copy.password}
                  errorMessage={error.password && error.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError({
                      ...error,
                      password: !e.target.value ? copy.errPassword : "",
                    });
                  }}
                />
              </div>
              <div className="col-12">
                <ExInput
                  type="text"
                  id="loginpurachseCode"
                  name="code"
                  value={code}
                  label={copy.code}
                  placeholder={copy.code}
                  errorMessage={error.code && error.code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError({
                      ...error,
                      code: !e.target.value ? copy.errCode : "",
                    });
                  }}
                />
              </div>
              <div className="loginButton d-flex gx-2 justify-content-center">
                <Button
                  type="submit"
                  className="bg-theme text-light cursor m10-top col-6 mx-2"
                  text={copy.submitUpdateCode}
                  onClick={submit}
                  style={{ borderRadius: "30px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateCode;
