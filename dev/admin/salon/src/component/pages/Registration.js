import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import { ExInput } from "../extras/Input";
import Button from "../extras/Button";
import { useDispatch } from "react-redux";
import { DangerRight } from "../api/toastServices";
import { useNavigate } from "react-router-dom";
import { signUp } from "../../redux/slice/authSlice";
import { SKEDISY_SALON_PORTAL_COPY as copy } from "../../constants/skedisyPortalCopy";

const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState({
    email: "",
    password: "",
    newPassword: "",
    code: "",
  });

  const submit = async () => {
    if (
      !email ||
      !password ||
      !code ||
      !newPassword ||
      newPassword !== password
    ) {
      const nextError = {};
      if (!email) nextError.email = copy.errEmail;
      if (!password) nextError.password = copy.errPassword;
      if (!newPassword) nextError.newPassword = copy.errConfirmPassword;
      if (newPassword !== password)
        nextError.newPassword = copy.errPasswordMismatch;
      if (!code) nextError.code = copy.errCode;
      return setError(nextError);
    }
    const loginData = { email, newPassword, password, code };
    const response = await dispatch(signUp(loginData)).unwrap();
    response?.status ? navigate("/") : DangerRight(response?.message);
  };

  return (
    <>
      <div className="mainLoginPage">
        <div className="loginDiv" style={{ width: "100%" }}>
          <div className="loginPage m-auto">
            <div className="loginTitle mb-3 d-flex">
              <a href="https://skedisy.com">
                <img src={logo} style={{ width: "50px" }} alt="Skedisy" />
              </a>
            </div>
            <p className="sk-portal-kicker mb-1">{copy.kicker}</p>
            <div className="fw-bold text-theme me-auto my-auto welComeTitle">
              {copy.welcome}
            </div>
            <h1 className="sk-portal-login-title">{copy.signUpTitle}</h1>
            <p className="sk-portal-subtitle">{copy.signUpSubtitle}</p>
            <h6 className="fw-bold text-theme me-auto my-auto fs-15 py-2 title">
              {copy.signUpHint}
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
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={newPassword}
                  label={copy.confirmPassword}
                  placeholder={copy.confirmPassword}
                  errorMessage={error.newPassword && error.newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError({
                      ...error,
                      newPassword: !e.target.value
                        ? copy.errConfirmPassword
                        : newPassword !== password
                          ? copy.errPasswordMismatch
                          : "",
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
                  text={copy.submitSignUp}
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

export default Registration;
