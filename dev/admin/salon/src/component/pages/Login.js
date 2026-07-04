/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ExInput } from "../extras/Input";
import Button from "../extras/Button";
import { login } from "../../redux/slice/authSlice";
import logo from "../../assets/images/logo.png";
import { SKEDISY_SALON_PORTAL_COPY as copy } from "../../constants/skedisyPortalCopy";

const Login = (props) => {
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    isAuth && navigate("/salonpanel/salonDashboard");
  }, [isAuth, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (!email || !password) {
      const nextError = {};
      if (!email) nextError.email = copy.errEmail;
      if (!password) nextError.password = copy.errPassword;
      return setError(nextError);
    }
    const loginData = { email, password };

    try {
      let response = await dispatch(login(loginData)).unwrap();
      if (response?.status) {
        setTimeout(() => {
          window.location.href = "/salonpanel/salonDashboard";
        }, 100);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="mainLoginPage sk-portal-pro">
      <div className="loginDiv">
        <div className="loginPage m-auto sk-portal-card">
          <div className="sk-portal-logo">
            <a
              href="https://skedisy.com"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              <img src={logo} alt="Skedisy" />
            </a>
          </div>
          <h1 className="sk-portal-login-title">{copy.loginTitle}</h1>
          <p className="sk-portal-badge">{copy.welcome}</p>
          <p className="sk-portal-subtitle">{copy.loginSubtitle}</p>
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
            <div className="loginButton d-flex justify-content-center">
              <Button
                type="submit"
                className="bg-theme text-light cursor sk-portal-submit"
                text={copy.submitLogin}
                onClick={submit}
              />
            </div>
          </div>
          <p className="sk-portal-footer text-center mb-0">
            <a href="https://skedisy.com" target="_blank" rel="noreferrer">
              {copy.footerLink}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
