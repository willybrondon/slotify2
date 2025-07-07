import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ExInput } from "../extras/Input";
import Button from "../extras/Button";
import logo from "../../assets/images/logo.png";
import { DangerRight } from "../api/toastServices";
import { updateCode } from "../../redux/slice/authSlice";

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
    if (!email || !password || !code ) {
      let error = {};
      if (!email) error.email = "Email is required";
      if (!password) error.password = "password is required !";

      if (!code) error.code = "purchase code is required !";
      return setError({ ...error });
    } else {
      const loginData = {
        email,

        password,
        code,
      };

      let response = await dispatch(updateCode(loginData)).unwrap();
      response?.status ? navigate("/login") : DangerRight(response?.message);
    }
  };
  return (
    <>
      <div className="mainLoginPage">
        <div className="loginDiv" style={{ width: "100%" }}>
          <div className="loginPage m-auto">
            <div className="loginTitle mb-3  d-flex ">
              <img src={logo} style={{ width: "50px" }} alt="logo" />
            </div>
            <div className="fw-bold text-theme  me-auto my-auto welComeTitle">
              Welcome Back
            </div>
            <h1>Update Code !</h1>
            <h6 className="fw-bold text-theme  me-auto my-auto fs-15 py-2 title">
              Please,Enter Your Email id , Password and New PurchaseCode
            </h6>
            <div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`email`}
                  name={`email`}
                  label={`Email`}
                  value={email}
                  placeholder={`Email`}
                  errorMessage={error.email && error.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        email: `email Id is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        email: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`password`}
                  id={`password`}
                  name={`password`}
                  value={password}
                  label={`Password`}
                  placeholder={`Password`}
                  errorMessage={error.password && error.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        password: `password is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        password: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`loginpurachseCode`}
                  name={`Purchase Code`}
                  value={code}
                  label={`Purchase Code`}
                  placeholder={`Purchase Code`}
                  errorMessage={error.code && error.code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        code: `Purchase Code is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        code: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="loginButton d-flex gx-2 justify-content-center">
                <Button
                  type={`submit`}
                  className={`bg-theme text-light cursor m10-top col-6 mx-2`}
                  text={`Sign In`}
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
