/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ExInput } from "../extras/Input";
import Button from "../extras/Button";
import { login } from "../../redux/slice/authSlice";
import logo from "../../assets/images/logo.png";
import { SKEDISY_ADMIN_PORTAL_COPY as copy } from "../../constants/skedisyPortalCopy";

const Login = (props) => {
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    isAuth && navigate("/admin");
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
    let response = await dispatch(login(loginData)).unwrap();
    response?.status && navigate("/admin");
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
            <h1 className="sk-portal-login-title">{copy.loginTitle}</h1>
            <p className="sk-portal-subtitle">{copy.loginSubtitle}</p>
            <h6 className="fw-bold text-theme me-auto my-auto fs-15 py-2 title">
              {copy.loginHint}
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
              <div className="loginButton d-flex gx-2 justify-content-center">
                <Button
                  type="submit"
                  className="bg-theme text-light cursor m10-top col-6 mx-2"
                  text={copy.submitLogin}
                  onClick={submit}
                  style={{ borderRadius: "30px" }}
                />
              </div>
            </div>
            <p className="sk-portal-footer mt-3 mb-0">
              <a href="https://skedisy.com">{copy.footerLink}</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
