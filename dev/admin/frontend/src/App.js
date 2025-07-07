import logo from "./logo.svg";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Login from "./component/pages/Login";
import { Route, Routes } from "react-router-dom";
import Admin from "./component/pages/Admin";
import AuthRoute from "./util/authRoute";
import "../src/assets/scss/custom/custom.css";
import "../src/assets/scss/default/default.css";
import "../src/assets/scss/style/style.css";
import "../src/assets/scss/dateRange.css";
import { setOldAdmin } from "./redux/slice/authSlice";
import { setToken } from "./util/setAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { apiInstanceFetch } from "./component/api/axiosApi";
import { useState } from "react";
import Registration from "./component/pages/Registration";
import UpdateCode from "./component/pages/UpdateCode";
import { useCallback } from "react";
function App() {
  const dispatch = useDispatch();
  const key = localStorage.getItem("key");
  const token = localStorage.getItem("token");
  const { isAuth } = useSelector((state) => state.auth);

  const [login, setLogin] = useState(false);

  const sessionTimeout = 20 * 60 * 1000; // 5 minutes in milliseconds
  let activityTimeout;

  const resetTimeout = useCallback(() => {
    if (activityTimeout) clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      window.sessionStorage.clear();
      window.sessionStorage.clear();
      window.location.href = "/";
    }, sessionTimeout);
  }, [activityTimeout, sessionTimeout]);

  const handleActivity = () => {
    resetTimeout();
  };

  useEffect(() => {
    axios
      .get("admin/login/login")
      .then((res) => {
        setLogin(res.data.login);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (!token && !key) return;
    dispatch(setOldAdmin(token));
  }, [setToken, key, token, isAuth]);

  useEffect(() => {
    console.log("sessionTimeout", sessionTimeout);

    // Set initial timeout
    resetTimeout();

    // Add event listeners to track user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, [resetTimeout]);
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={login ? <Login /> : <Registration />} />
          <Route path="/" element={<Login />} />
          <Route path="/code" element={<UpdateCode />} />
          {login && <Route path="/login" element={<Login />} />}
          <Route element={<AuthRoute />}>
            <Route path="/admin/*" element={<Admin />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
